# TOKENIZER

Tokenizer es una API que funciona enviando datos de una tarjeta y este después de verificar que todos los datos estén bien almacena la información en una base de datos. Además genera un token que retorna al usuario para que este solicite la información si cumple los requisitos.

## Installation

Usar el instalador de paquetes NPM, siguiendo los siguientes pasos:

npm install

Luego de la instalación, crear una archivo .env con los siguientes valores:

DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=
PUBLIC_KEY= {Colocar aquí la pk que será probada}
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=

## Usage

Para iniciar el programa de manera local correr el comando:

npm run serverless

Para crear un build de la API:

npm run build

Para correr los test cases:

npm run test


## License

[MIT](https://choosealicense.com/licenses/mit/)