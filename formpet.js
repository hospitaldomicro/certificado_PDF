const express = require("express");
const app = express();
const PDFDocument = require("pdfkit");
const sharp = require("sharp"); //para lidar com a orientação da imagem
const stream = require("stream");
const multer = require("multer"); // Middleware para upload de arquivos
const { format } = require("date-fns"); // Importa a função 'format' do date-fns

app.use(express.urlencoded({ extended: false }));

// Configuração do multer para fazer o upload de arquivos
const storage = multer.memoryStorage(); // Armazena a imagem na memória
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    // Aqui você envia o formulário HTML para o cliente
    const form = `
    <!DOCTYPE html>
    <html lang="pt-br">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
            />
            <title>Formulário para Geração de Certidão PET em PDF</title>
        </head>
        <body>
            <div class="container">
                <div class="text-center">
                    <h1>Preencha o Formulário</h1>
                </div>
                <form
                    action="/gerar-pdf"
                    method="post"
                    enctype="multipart/form-data"
                >
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name_pet" class="form-label"
                                    >Nome do Pet:</label
                                >
                                <input
                                    type="text"
                                    id="name_pet"
                                    name="name_pet"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="foto" class="form-label"
                                    >Foto 3x4 do Pet (somente .jpg):</label
                                >
                                <input
                                    type="file"
                                    id="foto"
                                    name="foto"
                                    class="form-control"
                                    accept="image/jpeg"
                                />
                            </div>
                        </div>
    
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="data_adocao" class="form-label"
                                    >Data de Adoção:</label
                                >
                                <input
                                    type="date"
                                    id="data_adocao"
                                    name="data_adocao"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="especie" class="form-label"
                                    >Espécie:</label
                                >
                                <input
                                    type="text"
                                    id="especie"
                                    name="especie"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="genero" class="form-label"
                                    >Gênero:</label
                                >
                                <select
                                    id="genero"
                                    name="genero"
                                    class="form-select"
                                    required
                                >
                                    <option value=""></option>
                                    <option value="Macho">Macho</option>
                                    <option value="Femea">Fêmea</option>
                                </select>
                            </div>
                        </div>
    
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="castrado" class="form-label"
                                    >Castrado:</label
                                >
                                <select
                                    id="castrado"
                                    name="castrado"
                                    class="form-select"
                                    required
                                >
                                    <option value=""></option>
                                    <option value="Sim">Sim</option>
                                    <option value="Não">Não</option>
                                </select>
                            </div>
                        </div>
    
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="raca" class="form-label">Raça:</label>
                                <input
                                    type="text"
                                    id="raca"
                                    name="raca"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
    
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="cor" class="form-label">Cor:</label>
                                <input
                                    type="text"
                                    id="cor"
                                    name="cor"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div class="mb-6">
                            <label for="tutor" class="form-label"
                                >Nome do Tutor:</label
                            >
                            <input
                                type="text"
                                id="tutor"
                                name="tutor"
                                class="form-control"
                                required
                            />
                        </div>
    
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="data_expedicao" class="form-label"
                                    >Data da Expedição:</label
                                >
                                <input
                                    type="date"
                                    id="data_expedicao"
                                    name="data_expedicao"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="naturalidade" class="form-label"
                                    >Naturalidade:</label
                                >
                                <input
                                    type="text"
                                    id="naturalidade"
                                    name="naturalidade"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                    </div>
    
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary">
                            Gerar Certificado
                        </button>
                    </div>
                </form>
            </div>
    
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                // Definir a data atual como padrão no campo de data
                let today = new Date().toISOString().substr(0, 10);
                document.getElementById("data_adocao").value = today;
                document.getElementById("data_expedicao").value = today;
            </script>
        </body>
    </html>    
    `;
    res.send(form);
});

// Use o middleware 'upload' para lidar com o upload de arquivos
app.post("/gerar-pdf", upload.single("foto"), (req, res) => {
    const name_pet = req.body.name_pet;
    const foto = req.file; // Use 'req.file' para acessar a imagem enviada
    const data_adocao = req.body.data_adocao;
    const especie = req.body.especie;
    const genero = req.body.genero;
    const castrado = req.body.castrado;
    const raca = req.body.raca;
    const cor = req.body.cor;
    const tutor = req.body.tutor;
    const data_expedicao = req.body.data_expedicao;
    const naturalidade = req.body.naturalidade;

    // Define o tamanho da página A4 (595.28 x 841.89) segundo Pdfkit library
    const pageWidth = 595.28;
    const pageHeight = 841.89;

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

    // Esta função processa a imagem e a adiciona ao PDF
    function processImage(imageBuffer) {
        let x, y; // Declarando as variáveis aqui
        sharp(imageBuffer)
            .metadata()
            .then((metadata) => {
                const height = 150; // Altura da imagem no PDF
                const width = (height * metadata.width) / metadata.height;
                if (height > width) {
                    x = 245; // Define a posição X da imagem no PDF
                    y = 205; // Define a posição Y da imagem no PDF
                } else {
                    x = 190; // Define a posição X da imagem no PDF
                    y = 205; // Define a posição Y da imagem no PDF
                }
                pdfDoc
                    .image(imageBuffer, x, y, { height, width })
                    .rect(x, y, width, height)
                    .stroke();

                // Chama a função para adicionar o restante do conteúdo de texto
                addTextContent();
            })
            .catch((err) => {
                console.error("Erro ao processar a imagem:", err);
                // Se ocorrer um erro no processamento da imagem, ainda podemos gerar o restante do PDF
                addTextContent();
            });
    }

    // Esta função adiciona o restante do conteúdo de texto ao PDF
    function addTextContent() {
        pdfDoc.fontSize(12);
        pdfDoc.fillColor("black");

        const dataAdocao = format(new Date(data_adocao), "dd/MM/yyyy");
        const dataExpedicao = format(new Date(data_expedicao), "dd/MM/yyyy");

        pdfDoc.text(` ${name_pet}`, marginLeft + 65, marginTop + 380);
        pdfDoc.text(` ${dataAdocao}`, marginLeft + 65, marginTop + 435);
        pdfDoc.text(` ${especie}`, marginLeft + 290, marginTop + 435);
        pdfDoc.text(` ${genero}`, marginLeft + 65, marginTop + 490);
        pdfDoc.text(` ${castrado}`, marginLeft + 290, marginTop + 490);
        pdfDoc.text(` ${raca}`, marginLeft + 65, marginTop + 545);
        pdfDoc.text(` ${cor}`, marginLeft + 290, marginTop + 545);
        pdfDoc.text(` ${tutor}`, marginLeft + 65, marginTop + 600);
        pdfDoc.text(` ${dataExpedicao}`, marginLeft + 65, marginTop + 655);
        pdfDoc.text(` ${naturalidade}`, marginLeft + 290, marginTop + 655);

        // Finaliza o PDF
        pdfDoc.end();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=formulario.pdf"
        );

        streamBuffer.pipe(res);
    }

    // Verifique se a foto foi fornecida e processe-a, se necessário
    if (foto) {
        sharp(foto.buffer)
            .rotate() // Rotação automática com base nos metadados da imagem
            .toBuffer()
            .then((imageBuffer) => {
                processImage(imageBuffer);
            })
            .catch((err) => {
                console.error("Erro ao processar a imagem:", err);
                // Se ocorrer um erro no processamento da imagem, ainda podemos gerar o restante do PDF
                addTextContent();
            });
    } else {
        // Se não houver imagem, apenas gere o restante do PDF
        addTextContent();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
});
