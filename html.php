<?php

function head(){
    echo '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="style.css">
        </head>';
}

function bodyStart(){
    echo '
        <body>
        <div id="container"></div>';
}

function bodyEnd(){
    echo '
        </body>
        <script src="script.js"></script>
        </html>';
}