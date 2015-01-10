git checkout develop
rsync -vrua --delete dist/ vs1:/usr/share/nginx/www/openvoc-staging/
