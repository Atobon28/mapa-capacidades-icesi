'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const descriptions = [
'Reconocer la singularidad de las personas y dar lugar a sus experiencias en las relaciones y los espacios compartidos.',
'Reconocer el valor de todas las personas y promover relaciones de cuidado frente a la vulnerabilidad, la humillación y la discriminación.',
'Actuar con consideración hacia los demás y reconocer su igualdad en dignidad y valor moral.',
'Comprender la diversidad de experiencias e identidades y analizar críticamente los prejuicios y mecanismos de exclusión.',
'Construir acuerdos, cooperar y abordar los desacuerdos de manera pacífica en contextos de pluralismo.',
'Relacionarse respetuosamente con distintas culturas, formas de vida y saberes, y construir aprendizajes colectivos.',
'Participar en asuntos colectivos, construir posiciones argumentadas y asumir responsabilidades frente a los derechos, los deberes y la justicia social.',
'Construir criterios propios, asumir las consecuencias de las acciones y orientar iniciativas hacia el bien común.',
'Reconocer emociones, desarrollar empatía y construir relaciones de cuidado, confianza y respeto.'
];
const questions = [
'¿En qué momentos de tu clase los estudiantes escuchan otras experiencias y reconocen las contribuciones de sus compañeros?',
'¿Cómo favorecen tus actividades el cuidado y el trato digno de las personas involucradas?',
'¿Cómo se expresa el respeto en la participación, la retroalimentación y las relaciones dentro de tu clase?',
'¿Cómo las actividades de tu curso permiten contrastar perspectivas e identificar prejuicios o formas de exclusión?',
'¿Qué oportunidades tienen los estudiantes para construir acuerdos y gestionar los desacuerdos durante tus actividades?',
'¿Qué saberes y experiencias tienen lugar en tu clase y cómo entran en diálogo?',
'¿Cómo pueden los estudiantes relacionar los contenidos de tu asignatura con decisiones y responsabilidades colectivas?',
'¿Qué oportunidades ofrecen las actividades de aprendizaje para que los estudiantes tomen decisiones autónomas, expliquen las razones que las sustentan y reflexionen sobre sus consecuencias y responsabilidades?',
'¿Cómo se reconocen y expresan las emociones que surgen durante el trabajo colaborativo, los desacuerdos y los procesos de retroalimentación?'
];
const concepts = [
{name:'Capacidades',match:'capacidad',text:'Integran conocimientos, habilidades y disposiciones que una persona moviliza para comprender una situación, tomar decisiones y actuar de manera responsable en contextos diversos.',example:'Construir criterios propios y asumir responsabilidad por las propias acciones.'},
{name:'Habilidades',match:'habilidad',text:'Son formas de actuar y pensar que pueden desarrollarse y ponerse en práctica frente a situaciones concretas. Permiten hacer algo de manera intencionada.',example:'Identificar prejuicios y estereotipos, deliberar sobre asuntos colectivos o regular emociones en situaciones de conflicto.'},
{name:'Disposiciones',match:'disposición',text:'Son orientaciones y actitudes que influyen en la manera como una persona se relaciona con otros y está dispuesta a actuar. Expresan una apertura o inclinación a actuar de determinadas maneras.',example:'Valorar la singularidad de las personas, actuar con consideración hacia otros o valorar la diversidad cultural.'}
];
const guidelines = [
['Integrar la paz de manera transversal','Relaciona los aprendizajes del mapa con los propósitos y contenidos de tu asignatura. Identifica oportunidades para trabajarlos dentro de las experiencias de aprendizaje propias de tu disciplina.'],
['Fortalecer el reconocimiento y la convivencia','Revisa cómo tu clase favorece el reconocimiento de las personas, el trato digno, la comprensión de la diferencia y la participación en asuntos colectivos.'],
['Promover experiencias dialógicas, críticas y situadas','Genera oportunidades para escuchar perspectivas distintas, argumentar, analizar problemas cercanos y construir respuestas colectivas.'],
['Conectar historia, territorio y práctica','Cuando sea pertinente para tu curso, relaciona los contenidos con memorias, experiencias territoriales y acciones concretas de construcción de paz. Da lugar a distintas voces y evita simplificar sus experiencias.']
];
let data=[], selected={}, course='', filter='Todas', query='', lastFocus=null, activeId=null, toastTimer, persistent=true;
try { const state=JSON.parse(localStorage.getItem('icesi-paz-v1')||'{}'); if(state.selected && typeof state.selected==='object' && !Array.isArray(state.selected)) selected=state.selected; if(typeof state.course==='string') course=state.course; } catch { persistent=false; }
function save(){try{localStorage.setItem('icesi-paz-v1',JSON.stringify({selected,course}));$('#save-status').textContent='Cambios guardados en este navegador. No se envían a un servidor.';}catch{persistent=false;$('#save-status').textContent='El navegador no permite guardar. Descarga tu selección antes de salir.';}}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2400);}
function openDialog(id){lastFocus=document.activeElement;$(id).showModal();}
function closeDialog(d){d.close();if(lastFocus?.isConnected)lastFocus.focus();}
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target.closest('.close'))closeDialog(d);});});
$('#how').onclick=()=>openDialog('#help');
$('#glossary-open').onclick=()=>openDialog('#glossary');
$('#glossary-content').innerHTML=concepts.map(c=>`<article class="glossary-entry"><h3>${c.name}</h3><p>${c.text}</p><p class="muted"><strong>Por ejemplo:</strong> ${c.example}</p></article>`).join('');
$('#concept-list').innerHTML=concepts.map(c=>`<details open><summary>${c.name}</summary><p>${c.text}</p><p class="example"><strong>Por ejemplo:</strong> ${c.example}</p></details>`).join('');
$('#guidelines').innerHTML=guidelines.map((g,i)=>`<article class="guideline"><span class="number">0${i+1}</span><h3>${g[0]}</h3><p>${g[1]}</p></article>`).join('');
function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function renderMap(){
 const dimensions=['Ética','Social y política','Formativa'];let total=0;let visibleDimensions=0;
 $('#map-grid').innerHTML=dimensions.map((dimension,index)=>{
 const nodes=data.filter(d=>d.dimension===dimension&&(filter==='Todas'||filter===dimension)&&normalize([d.name,d.type,...d.items].join(' ')).includes(normalize(query)));
 total+=nodes.length;if(!nodes.length)return '';visibleDimensions++;
 return `<section class="dimension" style="--accent:${['#5454e9','#5454e9','#5454e9'][index]};--tint:${['color-mix(in srgb,#5454e9 7%,white)','color-mix(in srgb,#4cb979 10%,white)','color-mix(in srgb,#865cf0 8%,white)'][index]}"><h3 class="dimension-title"><span class="dimension-number">0${index+1}</span>${dimension}</h3><div class="branches">${nodes.map(d=>{const count=d.items.filter((_,j)=>selected[d.id+'-'+j]).length;return `<button class="node" data-node="${d.id}" aria-label="Explorar ${esc(d.name)}${count?', '+count+' aprendizajes seleccionados':''}"><span class="type">${esc(d.type)}</span><strong>${esc(d.name)}</strong><span class="node-bottom"><span>${d.items.length} aprendizajes${count?` · <span class="node-saved">${count}</span>`:''}</span><span aria-hidden="true">↗</span></span></button>`;}).join('')}</div></section>`;
 }).join('');$('#no-results').hidden=total>0;document.querySelector('.map-foot').firstElementChild.textContent=`${visibleDimensions} ${visibleDimensions===1?'dimensión':'dimensiones'} / ${total} ${total===1?'eje':'ejes'}`;
 document.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>showDetail(Number(b.dataset.node)));
}
function options(value){return `<option value=""${!value?' selected':''}>Sin seleccionar</option><option value="actual"${value==='actual'?' selected':''}>Lo trabajo en mi curso</option><option value="fortalecer"${value==='fortalecer'?' selected':''}>Quiero fortalecerlo</option>`;}
function showDetail(id){activeId=id;const d=data[id];$('#detail-dimension').textContent=d.dimension;
 const related=concepts.filter(c=>d.type.toLowerCase().includes(c.match));
 $('#detail-body').innerHTML=`<h2 id="detail-title">${esc(d.name)}</h2><span class="badge">${esc(d.type)}</span><p class="detail-description">${descriptions[id]}</p><div class="detail-concepts">${related.map(c=>`<p><strong>${c.name}.</strong> ${c.text}</p>`).join('')}</div><h3>Aprendizajes relacionados</h3><p class="small muted">Indica cuáles consideras que trabajas y cuáles quieres fortalecer.</p>${d.items.map((item,j)=>`<label class="learning-row"><span>${esc(item)}</span><select data-learning="${id}-${j}" aria-label="${esc(item)} Estado en mi curso">${options(selected[id+'-'+j]?.status)}</select></label>`).join('')}<div class="question"><span>Para conectar con tu curso</span>${questions[id]}</div><div class="detail-actions"><p class="small muted">Tu selección expresa una reflexión sobre tu práctica, no una evaluación de tu curso.</p><button class="primary" id="detail-selection">Ver mi selección →</button></div>`;
 document.querySelectorAll('[data-learning]').forEach(s=>s.onchange=()=>changeSelection(s.dataset.learning,s.value));
 $('#detail-selection').onclick=()=>{closeDialog($('#detail'));location.hash='seleccion';};openDialog('#detail');
}
function changeSelection(key,status){if(status){selected[key]={...(selected[key]||{}),status};toast('Selección actualizada.');}else{delete selected[key];toast('Aprendizaje retirado de tu selección.');}save();updateCount();renderMap();renderSelection();}
function updateCount(){$('#count').textContent=Object.keys(selected).length;}
function renderSelection(){const keys=Object.keys(selected);$('#download').disabled=!keys.length;$('#print-selection').disabled=!keys.length;$('#clear').disabled=!keys.length;$('#course').value=course;
 if(!keys.length){$('#selection-list').innerHTML='<div class="empty"><h2>Aún no has seleccionado aprendizajes.</h2><p>Explora el mapa y añade los que quieres relacionar con tu curso.</p><a class="primary button" href="#explorar">Explorar el mapa →</a></div>';return;}
 $('#selection-list').innerHTML=keys.map(key=>{const [i,j]=key.split('-').map(Number), d=data[i], s=selected[key];return `<article class="selection-card"><div class="selection-card-top"><span class="meta">${esc(d.dimension)} / ${esc(d.name)} · ${esc(d.type)}</span><select data-state="${key}" aria-label="Estado de ${esc(d.items[j])}">${options(s.status)}</select></div><h3>${esc(d.items[j])}</h3><div class="reflection-grid"><label>¿Cómo lo relacionas con tu curso?<textarea rows="3" data-reflection="${key}" placeholder="Describe una actividad o una situación de clase que te permita explicar esta relación.">${esc(s.reflection||'')}</textarea></label><label>¿Qué podrías observar?<textarea rows="3" data-evidence="${key}" placeholder="Describe acciones, decisiones o producciones de los estudiantes que te ayudarían a reconocer este aprendizaje.">${esc(s.evidence||'')}</textarea></label></div><button class="text-button danger" data-remove="${key}">Quitar de mi selección ×</button></article>`;}).join('');
 document.querySelectorAll('[data-state]').forEach(s=>s.onchange=()=>changeSelection(s.dataset.state,s.value));
 document.querySelectorAll('[data-reflection],[data-evidence]').forEach(t=>t.oninput=()=>{const field=t.dataset.reflection?'reflection':'evidence',key=t.dataset.reflection||t.dataset.evidence;selected[key][field]=t.value;save();});
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>changeSelection(b.dataset.remove,''));
}
$('#course').oninput=e=>{course=e.target.value;save();};
$('#search').oninput=e=>{query=e.target.value;renderMap();};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderMap();});
$('#clear').onclick=()=>openDialog('#confirm');
$('#confirm-clear').onclick=()=>{selected={};save();updateCount();renderSelection();renderMap();closeDialog($('#confirm'));toast('Selección borrada.');};
$('#assistant-open').onclick=()=>openDialog('#assistant');
$('#demo-run').onclick=()=>{$('#demo-result').hidden=false;$('#demo-result').scrollIntoView({behavior:'smooth',block:'nearest'});};
$('#download').onclick=()=>{let text='MI SELECCIÓN · EDUCACIÓN PARA LA PAZ\nUniversidad Icesi\nCurso: '+(course||'Sin especificar')+'\n\n';for(const key of Object.keys(selected)){const [i,j]=key.split('-').map(Number), d=data[i],s=selected[key];text+=d.dimension+' / '+d.name+' / '+d.type+'\n'+d.items[j]+'\nEstado: '+(s.status==='actual'?'Lo trabajo en mi curso':'Quiero fortalecerlo')+'\nRelación con mi curso: '+(s.reflection||'Por completar')+'\nQué podría observar: '+(s.evidence||'Por completar')+'\n\n';}text+='Tu selección expresa una reflexión sobre tu práctica. No certifica el desarrollo de estos aprendizajes.\nSubvención CA06130105 - Lineamientos pedagógicos éticos en educación para la paz\n';const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mi-seleccion-educacion-para-la-paz.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Selección descargada.');};
function route(){const hash=location.hash.slice(1), page=['orientaciones','seleccion'].includes(hash)?hash:'explorar';document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==page);document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(hash==='mapa')setTimeout(()=>$('#mapa').scrollIntoView(),0);else window.scrollTo(0,0);document.title=(page==='seleccion'?'Mi selección':page==='orientaciones'?'Orientaciones':'Mapa de capacidades')+' · Icesi';}
window.addEventListener('hashchange',route);
function buildPrint(){
 $('#print-content').innerHTML=`<h1>Mi selección</h1><p>Universidad Icesi · Educación para la paz</p><p><strong>Curso:</strong> ${esc(course||'Sin especificar')}</p>`+Object.keys(selected).map(key=>{const [i,j]=key.split('-').map(Number),d=data[i],s=selected[key];return `<article class="print-card"><p>${esc(d.dimension)} / ${esc(d.name)} · ${esc(d.type)}</p><h2>${esc(d.items[j])}</h2><p><strong>Estado:</strong> ${s.status==='actual'?'Lo trabajo en mi curso':'Quiero fortalecerlo'}</p><h3>¿Cómo lo relacionas con tu curso?</h3><p>${esc(s.reflection||'Por completar')}</p><h3>¿Qué podrías observar?</h3><p>${esc(s.evidence||'Por completar')}</p></article>`;}).join('')+'<p>Esta selección expresa una reflexión sobre la práctica y no certifica el desarrollo de aprendizajes.</p><p>Subvención CA06130105 · Lineamientos pedagógicos éticos en educación para la paz</p>';
}
$('#print-selection').onclick=()=>{buildPrint();window.print();};
window.addEventListener('beforeprint',buildPrint);

fetch('data.json').then(r=>{if(!r.ok)throw new Error('data');return r.json();}).then(items=>{data=items;for(const key of Object.keys(selected)){const [i,j]=key.split('-').map(Number);if(!data[i]?.items[j]||!['actual','fortalecer'].includes(selected[key]?.status))delete selected[key];}updateCount();renderMap();renderSelection();route();if(!persistent)$('#save-status').textContent='El navegador no permite guardar. Descarga tu selección antes de salir.';}).catch(()=>{$('#map-grid').innerHTML='<p>No pudimos cargar el mapa. Actualiza la página para intentarlo nuevamente.</p>';});
