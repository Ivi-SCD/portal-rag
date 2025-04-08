#!/bin/sh
echo "Running with env: $ENVNAME"
echo "Running with user:" $(id)
## Copia arquivo environment de acordo com a variavel informada na da devconsole
cp -fv /usr/share/nginx/html/environment/env.$ENVNAME.js /usr/share/nginx/html/environment/env.js

# Altera arquivo de ambiente do proxy para a API.
cp -fv /etc/nginx/conf.d/env/default.$ENVNAME.conf /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;'
