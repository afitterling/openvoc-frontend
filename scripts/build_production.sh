gulp clean && \
gulp build && \
gulp settings-production && \
rsync -avr app/bower_components dist/ && \
./scripts/patch_baseUrl_production.sh #&& \
