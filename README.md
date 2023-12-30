# Citation.js Toolforge Tool

Citation.js Tool for Wikimedia Toolforge. See documentation: https://citation-js.toolforge.org/

## Deploy

Deploy changes (requires account, tool):

```sh
ssh -i $path_to_ssh_private_key $shell_username@login.toolforge.org
become $tool_name
cd www/js
git pull
# npm install
cd ../..
webservice --backend=kubernetes node18 restart
```
