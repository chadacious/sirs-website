## A website for managing the Scene Intensity Rating Scale system


## Docker build command
docker build -t chadicus/sirs-website:0.1.0 . --build-arg NPM_TOKEN=

docker push chadicus/sirs-website:0.1.0

kubectl set image deployment/sirs-website sirs-website=chadicus/sirs-website:0.1.0
