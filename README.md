# certificado_PDF
Node v18 com as libs Express, Multer, Sharp, Date-fns e PDFkit.
O código pega dados submetidos via form e gera um certificado no formato PDF para download.
Certificado contém uma imagem de fundo que pode ser um certificado em branco de uma universidade ou curso com logo e assinaturas se houver.
Simplesmente escrevemos o conteúdo do formulário submetido sobre a imagem de fundo. O documento está no formato A4.
A ideia é preencher certificados online em eventos, ou fazer isso obtendo os dados de um banco.

# como implantar
O servidor Node.js vai lidar com as solicitações do formulário e gerar o PDF. Você pode usar um framework como Express.js para isso. Certifique-se de ter o Node.js instalado em seu ambiente. Vamos usar a biblioteca "pdfkit", a biblioteca "sharp" para detectar e tratar a orientação da foto submetida no form,  a biblioteca "date-fms" para formatar a data antes de gerar o pdf e "multer" para fazer upload do arquivo foto.
Certifique-se de instalá-la as dependências usando: npm install pdfkit multer sharp date-fns express

Neste código, configuramos um servidor Express.js para lidar com as solicitações GET e POST. Quando o cliente acessa a rota principal ("/"), ele recebe o formulário HTML. Quando o formulário é enviado, os dados são coletados no servidor, o PDF é gerado e enviado de volta como uma resposta para download.

# observações
Lembre-se de substituir 'caminho_da_imagem' pelo caminho real da imagem de fundo que você deseja usar.
Você pode executar o servidor Node.js usando o comando node server.js (supondo que o código esteja em um arquivo chamado server.js).
A imagem de fundo deve ser um recurso acessível pelo servidor, ou seja, ela deve estar no mesmo diretório ou em um diretório acessível.

