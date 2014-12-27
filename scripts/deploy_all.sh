git checkout develop
./scripts/build_staging.sh 
./scripts/push_staging.sh 
git checkout master
./scripts/build_production.sh 
./scripts/push_production.sh 

