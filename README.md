# Citation.js Toolforge Tool

Citation.js Tool for Wikimedia Toolforge. See documentation: https://citation-js.toolforge.org/

## Deploy

Deploy changes (requires account, tool):

```
ssh -i <path-to-ssh-private-key> <shell-username>@login.toolforge.org
become <tool-name>
cd www/js
git pull
cd ../..
webservice --backend=kubernetes node18 restart
```
