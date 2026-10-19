import re,os
os.makedirs('dist',exist_ok=True)
h=open('index.html').read()
css=open('css/style.css').read()
h=h.replace('<link rel="stylesheet" href="css/style.css">','<style>'+css+'</style>')
for f in ['art','app']:
    h=h.replace(f'<script src="js/{f}.js"></script>','<script>'+open(f'js/{f}.js').read().replace('</script>','<\\/script>')+'</script>')
open('dist/aloft.html','w').write(h)
print(len(h)//1024,'KB')
