# Contributing

## Deploy

```bash
ssh $USER@login.toolforge.org
become citation-js
cd www/js
git pull
cd ../..
webservice --backend=kubernetes node20 restart
```
