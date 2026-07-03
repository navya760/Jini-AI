import os, hashlib, json, ast, re
root = r"c:\Users\Navya\Jini AI"
all_files=[]
for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        rel = os.path.relpath(os.path.join(dirpath, fn), root).replace('\\','/')
        all_files.append(rel)
all_files.sort()

build_artifacts=[f for f in all_files if '__pycache__/' in f or f.startswith('frontend/dist/') or f.endswith('.pyc')]

hashes={}
for rel in all_files:
    p=os.path.join(root, rel)
    if not os.path.isfile(p):
        continue
    try:
        with open(p, 'rb') as fh:
            h=hashlib.sha256(fh.read()).hexdigest()
    except Exception:
        continue
    hashes.setdefault((os.path.basename(rel), h), []).append(rel)

dupe_groups=[paths for paths in hashes.values() if len(paths)>1]

source_files=[f for f in all_files if f.endswith(('.ts','.tsx','.js','.jsx','.py'))]
texts={}
for rel in source_files:
    try:
        with open(os.path.join(root, rel), 'r', encoding='utf-8') as fh:
            texts[rel]=fh.read()
    except Exception:
        texts[rel]=''

refs={rel:0 for rel in all_files}
for rel, txt in texts.items():
    for other in all_files:
        if other==rel:
            continue
        base=os.path.basename(other)
        if other in txt or base in txt:
            refs[other]+=1

entrypoints={'frontend/src/main.tsx','frontend/src/App.tsx','backend/main.py','backend/app/main.py','frontend/index.html'}
unused_files=[]
for rel in source_files:
    if rel in entrypoints or rel.startswith('frontend/dist/') or rel.startswith('backend/__pycache__/') or rel.startswith('backend/app/__pycache__/'):
        continue
    if refs.get(rel,0)==0:
        unused_files.append(rel)

unused_imports=[]
for rel, txt in texts.items():
    if rel.endswith(('.ts','.tsx','.js','.jsx')):
        for m in re.finditer(r'^\s*import\s+([^;]+?)\s+from\s+["\']', txt, re.MULTILINE):
            names=m.group(1).strip()
            if names.startswith('{') and names.endswith('}'):
                names=[n.split(' as ')[0].strip() for n in names[1:-1].split(',') if n.strip()]
            elif names.startswith('* as '):
                names=[names[5:].strip()]
            elif names.startswith('type '):
                names=[names[5:].strip()]
            else:
                names=[names.split(' as ')[0].strip()]
            for name in names:
                if name and not re.search(rf'\b{name}\b', txt[:m.start()]+txt[m.end():]):
                    unused_imports.append((rel, name, m.group(0).strip()))
    elif rel.endswith('.py'):
        try:
            tree=ast.parse(txt)
        except Exception:
            continue
        imports=[]
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for n in node.names:
                    imports.append((n.asname or n.name.split('.')[0], f"import {n.name}"))
            elif isinstance(node, ast.ImportFrom):
                module=node.module or ''
                for n in node.names:
                    imports.append((n.asname or n.name, f"from {module} import {n.name}"))
        for name, stmt in imports:
            if not re.search(rf'\b{name}\b', txt.replace(stmt, '')):
                unused_imports.append((rel, name, stmt))

todos=[]
console=[]
debug=[]
for rel, txt in texts.items():
    for i,line in enumerate(txt.splitlines(),1):
        if 'TODO' in line or 'todo' in line:
            todos.append((rel,i,line.strip()))
        if 'console.' in line:
            console.append((rel,i,line.strip()))
        if 'debugger' in line:
            debug.append((rel,i,line.strip()))

# dead code heuristics
dead=[]
for rel, txt in texts.items():
    if rel.endswith('.py'):
        try:
            tree=ast.parse(txt)
        except Exception:
            continue
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                name=node.name
                if txt.count(name) <= 1:
                    dead.append((rel, name, 'Python definition likely unused'))
    else:
        for m in re.finditer(r'^(?:export\s+)?(?:function|class)\s+([A-Za-z0-9_]+)', txt, re.MULTILINE):
            name=m.group(1)
            if txt.count(name) <= 1:
                dead.append((rel, name, 'JS/TS definition likely unused'))

report={
    'build_artifacts': build_artifacts,
    'duplicate_groups': dupe_groups,
    'unused_files': unused_files,
    'unused_imports': unused_imports,
    'todos': todos,
    'console_logs': console,
    'debugger_statements': debug,
    'dead_code_candidates': dead,
}
print(json.dumps(report, indent=2))
