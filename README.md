Run this after deploying:
```bash
cd /opt/pixel-pursuit/backend
sudo npx prisma migrate dev --name init
```
Run mobile app
```bash
npx expo start --tunnel
```