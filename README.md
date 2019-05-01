# WebdDiff finder

## Propópsito:

Detectar cambios en una página web, o en una parte de ella

Se genera un hash sha256 de la porción de html que indica el selector css,
ese código se compara con el que se genere en una siguiente ejecución para detectar si hubo cambios.

## Ejecución

1. Instalar nodejs

2. Instalar dependencias

    `npm install`

3. Generar un archivo de configuración llamado `pages.json` con la lista de urls y sus selectores, ejemplo:

```json
{
    "pages": [
        {
            "url": "https://github.com/axios/axios",
            "selector": "'.Box-body'"
        }
    ]
}
```

4. Ejecutar

    `node index.js`