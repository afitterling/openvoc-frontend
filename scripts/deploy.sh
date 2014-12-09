gulp clean
gulp build
rsync -avr app/bower_components dist/
./patch_baseUrl.sh 
./push.sh
