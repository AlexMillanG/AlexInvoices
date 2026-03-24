const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

let testTickets = [];
let reqRfc = ''

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(cors({
    origin:'*',
    methods:['POST']
}));


app.get('/hola',(req,res)=>{
    return res.status(200).json({
        message:'hola'
    })
})

// Endpoint POST
app.post('/data', (req, res) => {
    try {
        if (!req.body.codes || !Array.isArray(req.body.codes)) {
            return res.status(400).json({ error: "Se esperaba un array 'codes'" });
        }

        // Eliminar duplicados y asignar a testTickets
        testTickets = [...new Set(req.body.codes)];

        reqRfc = req.body.rfc

        console.log('Tickets únicos recibidos:', testTickets);
        res.status(200).json({
            message: 'Tickets recibidos sin duplicados',
            count: testTickets.length,
            tickets: testTickets
        });

        // Opcional: Ejecutar Puppeteer automáticamente al recibir datos
        runPuppeteerWithTickets(testTickets,reqRfc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const path = require('path');
// Función para ejecutar Puppeteer con los tickets
async function runPuppeteerWithTickets(tickets, rfc) {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: false,

            args: ['--start-maximized'], // <--- aquí
            defaultViewport: null
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(15000);
        page.setDefaultNavigationTimeout(30000);

        await page.goto('https://facturasgas.com/facturacion/autofactura.php', {
            waitUntil: 'networkidle2'
        });


        // Ingresar RFC
        await page.waitForSelector('input#RFC', { visible: true });
        await page.type('input#RFC', rfc);

        // Click en buscar
        await page.waitForSelector('button#button_search', { visible: true });
        await page.click('button#button_search');

        // Seleccionar opción del menú
        await page.waitForSelector('div.ui-menu-item-wrapper', { visible: true });
        await page.click('div.ui-menu-item-wrapper');

        // Procesar tickets
        for (const ticket of tickets) {
            try {
                console.log(`Procesando ticket: ${ticket}`);
                await page.waitForSelector('input#Ticket', { visible: true });
                await page.click('input#Ticket', { clickCount: 3 });
                await page.keyboard.press('Backspace');
                await page.type('input#Ticket', ticket);
                await page.click('button#Button_Add');
                console.log(`Ticket ${ticket} agregado`);
                await new Promise(r => setTimeout(r, 50)); // Pequeña pausa
            } catch (ticketError) {
                console.error(`Error con ticket ${ticket}:`, ticketError.message);
                continue;
            }
        }

        // Solicitar factura
        console.log('Haciendo clic en "Solicitar Factura"...');
        await page.waitForSelector('input#Button_Insert', { visible: true });
        await page.click('input#Button_Insert');
        await new Promise(r => setTimeout(r, 1000));
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 5000));

        console.log('Proceso completado');
    } catch (error) {
        console.error('Error en Puppeteer:', error.message);
    }// finally {
       // if (browser) await browser.close();
    //}
}




// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

