# QuizMaster

QuizMaster est une petite application web de quiz : on choisit une catégorie (Sports, Chimie, Économie, Astronomie, Maths, Architecture), on répond à des questions, et un classement compare les scores des joueurs.

Techniquement, c'est une application **Flask** (un framework Python pour faire des sites web) toute simple : pas de base de données, tout est stocké en mémoire et remis à zéro à chaque redémarrage.

Ce README explique deux choses séparément :
1. Comment lancer l'application sur ton ordinateur, en 2 minutes.
2. Comment elle est déployée "pour de vrai" avec Kubernetes, Helm et ArgoCD — et comment reproduire ce déploiement toi-même, étape par étape.

---

## 1. Lancer l'application en local (le plus simple)

Pas besoin de Docker ni de Kubernetes pour juste voir l'appli tourner.

```bash
pip install -r requirements.txt
python app/app.py
```

Ouvre ensuite [http://localhost:5000](http://localhost:5000) dans ton navigateur. C'est tout.

### Avec Docker (si tu préfères ne pas installer Python)

```bash
docker compose up --build
```

Même résultat sur [http://localhost:5000](http://localhost:5000), mais l'application tourne dans un conteneur Docker au lieu de tourner directement sur ta machine.

---

## 2. Comprendre le déploiement "pour de vrai"

En production, personne ne fait `python app.py` à la main. On utilise une chaîne d'outils automatisée. Voici l'idée, en partant de zéro :

- **Docker** : on empaquette l'application dans une "boîte" (une image) qui contient tout ce qu'il faut pour la faire tourner, où que ce soit.
- **Docker Hub** : un entrepôt en ligne où on range ces boîtes, pour qu'un serveur distant puisse aller les récupérer.
- **Kubernetes** : un système qui fait tourner des boîtes Docker sur un ensemble de machines (un "cluster"), et qui les redémarre automatiquement si elles plantent.
- **Helm** : Kubernetes se pilote avec des fichiers YAML très verbeux et répétitifs. Helm sert de "moule à gâteau" : on écrit un modèle une seule fois (un *chart*, dans le dossier [quiz-master/](quiz-master/)), et on ne change que quelques réglages (le fichier [values.yaml](quiz-master/values.yaml)) pour l'adapter à chaque situation.
- **ArgoCD** : un robot qui surveille en continu ce dépôt Git. Dès qu'un changement est mergé sur `main`, il compare "ce qui est écrit dans Git" avec "ce qui tourne réellement dans le cluster", et corrige automatiquement les différences. C'est ça, le **GitOps** : le dépôt Git est la seule vérité, on ne touche (presque) jamais au cluster à la main.

Le chemin complet, du code à l'application qui tourne :

```
toi (git push sur main)
        │
        ▼
GitHub Actions (CI)  →  construit l'image Docker  →  la pousse sur Docker Hub
        │
        ▼
ArgoCD (tourne en permanence dans le cluster)
        │  compare Git (désiré) et le cluster (réel)
        ▼
   applique automatiquement les différences, via le chart Helm
        │
        ▼
   l'application quiz-master tourne dans Kubernetes
```

---

## 3. Déployer depuis zéro sur ta machine (avec minikube)

`minikube` crée un petit cluster Kubernetes complet directement sur ton ordinateur (dans un conteneur Docker), pour s'entraîner sans toucher à un vrai serveur.

### Étape 1 — Créer le cluster local

```bash
minikube start --driver=docker
kubectl get nodes
```

Tu dois voir un nœud `minikube` avec le statut `Ready`.

### Étape 2 — Installer ArgoCD dans le cluster

```bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

> Le `--server-side` est nécessaire : sans ça, `kubectl apply` échoue sur un des fichiers d'ArgoCD car il est trop volumineux pour la méthode d'application classique.

Attends que tout démarre (ça prend une minute ou deux) :

```bash
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=180s
kubectl get pods -n argocd
```

Tous les pods doivent afficher `1/1` et `Running`.

### Étape 3 — Déployer QuizMaster via ArgoCD

Le fichier [argocd/quiz-master.yaml](argocd/quiz-master.yaml) dit à ArgoCD "surveille ce dépôt Git, et déploie le chart Helm qui s'y trouve". Il contient aussi une entrée pour un autre projet (`pdf-viewer`), qu'il ne faut pas modifier ici. Pour un premier essai en local sans déployer ce second projet, applique une copie limitée à `quiz-master` :

```bash
sed '/pdf-viewer/,+1d' argocd/quiz-master.yaml | kubectl apply -n argocd -f -
```

(En production, on applique directement `argocd/quiz-master.yaml` complet — les deux projets sont alors gérés ensemble, ce qui est le but recherché.)

Vérifie que l'application a bien été créée et synchronisée :

```bash
kubectl get application -n argocd
```

Tu dois voir `quiz-master` avec `SYNC STATUS: Synced` et `HEALTH STATUS: Healthy` (ça peut prendre 30 secondes à 1 minute).

### Étape 4 — Voir l'application tourner

```bash
kubectl port-forward svc/quiz-master -n default 5000:5000
```

Ouvre [http://localhost:5000](http://localhost:5000) : c'est la même application, mais maintenant déployée entièrement via Kubernetes + Helm + ArgoCD.

---

## 4. Suivre un déploiement existant (une fois que tout tourne)

Une fois le cluster et ArgoCD en place, voici les commandes utiles au quotidien.

### Voir l'état général

```bash
kubectl get application quiz-master -n argocd   # synchronisé ? en bonne santé ?
kubectl get pods -n default                     # les pods de l'appli tournent-ils ?
kubectl get deployment,service -n default       # vue d'ensemble des ressources
```

### Voir les logs de l'application

```bash
kubectl logs -l app.kubernetes.io/name=quiz-master -n default --tail=50
```

### Accéder à l'interface web d'ArgoCD (pratique pour visualiser l'arbre des ressources)

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Puis ouvre [https://localhost:8080](https://localhost:8080) (accepte le certificat auto-signé). Le nom d'utilisateur est `admin`, et le mot de passe initial se récupère avec :

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

### Forcer une resynchronisation manuelle (rarement nécessaire, ArgoCD le fait tout seul)

```bash
kubectl annotate application quiz-master -n argocd argocd.argoproj.io/refresh=hard --overwrite
```

### Un point important sur Helm

Une fois déployé par ArgoCD, la commande `helm list` ne montre **rien** : c'est normal. ArgoCD ne fait pas `helm install` (qui garderait une trace de la "release" dans Helm) — il fait l'équivalent de `helm template` (transforme le chart en YAML brut) puis applique ce YAML lui-même. Helm n'est donc qu'un outil de mise en forme utilisé une seule fois au moment du déploiement, pas un composant qui tourne en continu. Pour prévisualiser ce que le chart va produire sans rien déployer :

```bash
helm template quiz-master/
helm lint quiz-master/
```

---

## 5. Problèmes fréquents

- **Un pod reste en `ErrImageNeverPull`** : le fichier [quiz-master/values.yaml](quiz-master/values.yaml) doit avoir `pullPolicy: IfNotPresent` (pas `Never`) pour que Kubernetes aille chercher l'image sur Docker Hub.
- **`minikube start` échoue avec une erreur d'apiserver (`K8S_APISERVER_MISSING`)** : le profil local est probablement corrompu (souvent après un arrêt brutal de Docker). Repartir sur une base saine :
  ```bash
  minikube delete
  minikube start --driver=docker
  ```
- **`kubectl apply` échoue sur un CRD ArgoCD avec `annotations: Too long`** : utiliser `--server-side --force-conflicts` (voir Étape 2 ci-dessus).

---

## Structure du dépôt

```
app/                    # code Flask (routes, données en mémoire, templates HTML)
quiz-master/            # chart Helm (le "moule" pour générer les manifestes Kubernetes)
argocd/quiz-master.yaml # dit à ArgoCD quel dépôt/chart surveiller et déployer
.github/workflows/      # CI : construit l'image Docker et la pousse sur Docker Hub
Dockerfile              # comment construire l'image de l'application
docker-compose.yml      # pour lancer l'appli localement avec Docker
```
