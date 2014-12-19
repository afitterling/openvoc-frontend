gulp clean && \
gulp build && \
gulp settings-staging && \
rsync -avr app/bower_components dist/ && \
./scripts/patch_baseUrl.sh #&& \
