gulp clean
gulp build
rsync -avr app/bower_components dist/
./scripts/patch_baseUrl.sh 
./scripts/push.sh
