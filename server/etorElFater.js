const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['POST']
}));

// Variable global para controlar el estado del navegador
let browserInstance = null;

// Función para procesar los tickets
async function processTickets(tickets) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null
        });

        // Guardar la instancia del navegador para poder cerrarla después
        browserInstance = browser;

        const page = await browser.newPage();
        page.setDefaultTimeout(15000);
        page.setDefaultNavigationTimeout(30000);

        // Navegar a la página
        await page.goto('https://facturasgas.com/facturacion/autofactura.php', {
            waitUntil: 'networkidle2'
        });

        // Ingresar RFC
        await page.waitForSelector('input#RFC', { visible: true });
        await page.type('input#RFC', 'HIOL710917HJ8');

        // Click en buscar
        await page.waitForSelector('button#button_search', { visible: true });
        await page.click('button#button_search');

        // Seleccionar opción del menú
        await page.waitForSelector('div.ui-menu-item-wrapper', { visible: true });
        await page.click('div.ui-menu-item-wrapper');

        // Iterar sobre tickets
        for (const ticket of tickets) {
            try {
                console.log(`Procesando ticket: ${ticket}`);
                await page.waitForSelector('input#Ticket', { visible: true });
                await page.click('input#Ticket', { clickCount: 3 });
                await page.keyboard.press('Backspace');
                await page.type('input#Ticket', ticket);
                await page.click('button#Button_Add');
                console.log(`Ticket ${ticket} procesado`);
            } catch (ticketError) {
                console.error(`Error con ticket ${ticket}:`, ticketError.message);
                continue;
            }
        }

        // Solicitar factura
        try {
            console.log('Haciendo clic en "Solicitar Factura"...');
            await page.waitForSelector('input#Button_Insert', { visible: true, timeout: 10000 });
            await page.click('input#Button_Insert');
            await new Promise(r => setTimeout(r, 1000));
            await page.keyboard.press('Enter');
            console.log('Proceso de facturación completado');
        } catch (error) {
            console.error('Error al finalizar el proceso:', error.message);
            throw error;
        }
    } finally {
        if (browser) {
            await browser.close();
            browserInstance = null;
        }
    }
}

// Endpoint POST para recibir los tickets
app.post('/data', async (req, res) => {
    try {
        const { tickets } = req.body;

        if (!tickets || !Array.isArray(tickets)) {
            return res.status(400).json({ error: 'Se requiere un array de tickets' });
        }

        console.log('Tickets recibidos:', tickets);

        // Procesar los tickets en segundo plano
        processTickets(tickets)
            .then(() => console.log('Proceso completado exitosamente'))
            .catch(err => console.error('Error en el proceso:', err));

        res.status(200).json({
            message: 'Tickets recibidos y proceso iniciado',
            tickets: tickets
        });
    } catch (error) {
        console.error('Error en el endpoint:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para detener el navegador si es necesario
app.post('/stop', async (req, res) => {
    try {
        if (browserInstance) {
            await browserInstance.close();
            browserInstance = null;
            return res.status(200).json({ message: 'Navegador cerrado exitosamente' });
        }
        res.status(200).json({ message: 'No hay navegador activo' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cerrar el navegador' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Manejar cierre limpio del proceso
process.on('SIGINT', async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
    process.exit();
});