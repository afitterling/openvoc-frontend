gulp clean
gulp build
rsync -avr app/bower_components dist/
./scripts/patch_baseUrl_production.sh 
./scripts/push_production.sh
