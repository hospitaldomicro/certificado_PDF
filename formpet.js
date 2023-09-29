const express = require("express");
const app = express();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const stream = require("stream");
const multer = require("multer"); // Middleware para upload de arquivos

app.use(express.urlencoded({ extended: false }));

// Configuração do multer para fazer o upload de arquivos
const storage = multer.memoryStorage(); // Armazena a imagem na memória
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    // Aqui você envia o formulário HTML para o cliente
    const form = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Formulário para PDF</title>
        </head>
        <body>
            <h1>Preencha o Formulário</h1>
            <form action="/gerar-pdf" method="post" enctype="multipart/form-data">
                <label for="name">Nome do Pet:</label>
                <input type="text" id="name_pet" name="name_pet" required><br><br>
                
                <label for="data_adocao">Data de Adoção:</label>
                <input type="date" id="data_adocao" name="data_adocao" required><br><br>

                <label for="especie">Espécie:</label>
                <input type="text" id="especie" name="especie" required><br><br>
                
                <label for="genero">Gênero:</label><br>
                <input type="text" id="genero" name="genero" required><br><br>

                <label for="avatar">Choose a profile picture:</label>
                <input type="file" id="foto" name="foto" accept="image/jpeg" />
                
                <input type="submit" value="Gerar Certificado em PDF">
            </form>
        </body>
        </html>
    `;
    res.send(form);
});

// Use o middleware 'upload' para lidar com o upload de arquivos
app.post("/gerar-pdf", upload.single("foto"), (req, res) => {
    const name_pet = req.body.name_pet;
    const data_adocao = req.body.data_adocao;
    const especie = req.body.especie;
    const genero = req.body.genero;
    const foto = req.file; // Use 'req.file' para acessar a imagem enviada

    // Define o tamanho da página A4 com orientação landscape (297mm x 210mm)
    const pageWidth = 210;
    const pageHeight = 297;

    // Inicializa um novo documento PDF usando pdfkit em orientação landscape
    const pdfDoc = new PDFDocument({
        size: [pageWidth, pageHeight],
    });

    // Cria um stream de buffer
    const streamBuffer = new stream.PassThrough();

    // Pipe o PDF gerado para o streamBuffer
    pdfDoc.pipe(streamBuffer);

    // Define o caminho para a imagem de fundo (substitua 'caminho_da_imagem' pelo caminho real da sua imagem)
    const imagePath = "certidao-adocao-pet.jpg"; // Substitua pelo caminho real da imagem

    // Define margens de 2cm para cada lado
    const marginLeft = 20;
    const marginRight = pageWidth - 20;
    const marginTop = 20;
    const marginBottom = pageHeight - 20;

    // Adicione a imagem como plano de fundo com margens
    pdfDoc.image(imagePath, marginLeft, marginTop, {
        width: pageWidth - 40, // Leva em conta as margens esquerda e direita
        height: pageHeight - 40, // Leva em conta as margens superior e inferior
    });

    if (foto) {
        //Se foto foi enviada
        // Adicione a foto do animal usando 'foto.buffer'
        pdfDoc.image(foto.buffer, 85, 80, {
            width: 40, // Leva em conta as margens esquerda e direita
            height: 50, // Leva em conta as margens superior e inferior
        });
    }

    // Adicione conteúdo de texto dentro da imagem com margens de 5cm
    pdfDoc.fontSize(4);
    pdfDoc.fillColor("black");
    pdfDoc.text(` ${name_pet}`, marginLeft + 23, marginTop + 122);
    pdfDoc.text(` ${data_adocao}`, marginLeft + 23, marginTop + 139);
    pdfDoc.text(` ${especie}`, marginLeft + 92, marginTop + 139);
    pdfDoc.text(` ${genero}`, marginLeft + 23, marginTop + 157);

    // Finaliza o PDF
    pdfDoc.end();

    // Define os cabeçalhos da resposta HTTP
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=formulario.pdf");

    // Pipe o streamBuffer para a resposta HTTP
    streamBuffer.pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
});
