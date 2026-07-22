#!/bin/bash

echo "Nettoyage de Kubernetes..."
kubectl delete deployment quiz-master 2>/dev/null
kubectl delete service quiz-master 2>/dev/null

echo "Suppression des images Docker..."
docker rmi quiz-master:latest --force 2>/dev/null
docker image prune -f

echo "Reconstruction de l'image..."
docker build --no-cache -t quiz-master:latest .

echo "Déploiement sur Kubernetes..."
kubectl apply -f quiz-master-deployment.yaml
kubectl apply -f quiz-master-service.yaml

echo "Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod -l app=quiz-master --timeout=60s

echo "Terminé! Logs des pods:"
kubectl logs -l app=quiz-master --tail=20