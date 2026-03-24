const puppeteer = require('puppeteer');

const testTickets = [
    '11258052156235765',
    '11258052086933965',
    '11258052137165274',
    '11258052111833597',
    '11258052152715358',
    '11258052120301737',
    '11258052120417821',
    '11258052138073808',
    '11258052095145330',
    '11258052138383235',
    '11258052147866714'
];


(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null
        });
        const page = await browser.newPage();

        // Configurar timeouts más largos
        page.setDefaultTimeout(15000);
        page.setDefaultNavigationTimeout(30000);

        // Navegar a la página
        await page.goto('https://facturasgas.com/facturacion/autofactura.php', {
            waitUntil: 'networkidle2'
        });

        // Paso 1: Ingresar RFC
        await page.waitForSelector('input#RFC', { visible: true });
        await page.type('input#RFC', 'HIOF7311042X4');

        // Paso 2: Click en buscar
        await page.waitForSelector('button#button_search', { visible: true });
        await page.click('button#button_search');

        // Paso 3: Seleccionar opción del menú
        await page.waitForSelector('div.ui-menu-item-wrapper', { visible: true });
        await page.click('div.ui-menu-item-wrapper');

        // Iterar sobre tickets
        for (const ticket of testTickets) {
            try {
                console.log(`Procesando ticket: ${ticket}`);

                // Limpiar campo de ticket
                await page.waitForSelector('input#Ticket', { visible: true });
                await page.click('input#Ticket', { clickCount: 3 });
                await page.keyboard.press('Backspace');

                // Escribir ticket
                await page.type('input#Ticket', ticket);

                // Click en agregar
                await page.waitForSelector('button#Button_Add', { visible: true });
                await page.click('button#Button_Add');

                console.log(`Ticket ${ticket} procesado`);

            } catch (ticketError) {
                console.error(`Error con ticket ${ticket}:`, ticketError.message);
                // Continuar con el siguiente ticket
                continue;
            }
        }

        // Hacer clic en "Solicitar Factura" después de procesar todos los tickets
        try {
            console.log('Haciendo clic en "Solicitar Factura"...');
            await page.waitForSelector('input#Button_Insert', { visible: true, timeout: 100 });
            await page.click('input#Button_Insert');
              await new Promise(r => setTimeout(r, 1000));

            console.log('Clic en "Solicitar Factura" realizado con éxito');

            await page.keyboard.press('Enter');

            // Esperar para ver el resultado
            await new Promise(r => setTimeout(r, 5000));
        } catch (error) {
            console.error('Error al hacer clic en "Solicitar Factura":', error.message);
        }

        console.log('Proceso completado');
    } catch (error) {
        console.error('Error general:', error.message);
    } //finally {
        //if (browser) {
          //  await browser.close();
        //}
    //}
})();