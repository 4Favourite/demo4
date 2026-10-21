import re,os
os.makedirs('dist',exist_ok=True)
h=open('index.html').read()
css=open('css/style.css').read()
h=h.replace('<link rel="stylesheet" href="css/style.css">','<style>'+css+'</style>')
import glob,base64,json
ad={}
for fp in glob.glob('assets/*.*'):
    n,e=os.path.splitext(os.path.basename(fp))
    if e[1:] in('jpg','webp','png'):
        ad[n]='data:image/%s;base64,%s'%('jpeg' if e=='.jpg' else e[1:],base64.b64encode(open(fp,'rb').read()).decode())
h=h.replace('<script src="js/art.js">','<script>window.ASSET_DATA='+json.dumps(ad)+'</script><script src="js/art.js">')
for f in ['art','app','assets']:
    h=h.replace(f'<script src="js/{f}.js"></script>','<script>'+open(f'js/{f}.js').read().replace('</script>','<\\/script>')+'</script>')
open('dist/oakline.html','w').write(h)
print(len(h)//1024,'KB')
