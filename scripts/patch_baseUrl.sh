cat dist/index.html | sed 's/<base href="\/" /<base href="\/openvoc-staging\/" /g' > .tmp.html && \
mv .tmp.html dist/index.html
