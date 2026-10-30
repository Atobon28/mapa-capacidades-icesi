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
let data=[], selected={}, course='', profile={area:'',audience:'',description:'',activity:'',goal:''}, filter='Todas', query='', lastFocus=null, toastTimer;
const storageKey='icesi-paz-v1';
let storageAvailable=true;
try {
 const state=JSON.parse(localStorage.getItem(storageKey)||'{}');
 if(state.selected && typeof state.selected==='object' && !Array.isArray(state.selected))selected=state.selected;
 if(typeof state.course==='string')course=state.course;
 for(const key of Object.keys(profile))if(typeof state.profile?.[key]==='string')profile[key]=state.profile[key];
} catch {storageAvailable=false;}
function save(){
 try{localStorage.setItem(storageKey,JSON.stringify({selected,course,profile}));storageAvailable=true;}catch{storageAvailable=false;}
 const message=storageAvailable?'Cambios guardados en este navegador. No se envían a un servidor.':'Este navegador no permite guardar. Descarga tu reflexión antes de salir.';
 $('#save-status').textContent=message;$('#course-save-status').textContent=message;
}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function openDialog(id){lastFocus=document.activeElement;$(id).showModal();}
function closeDialog(d){d.close();if(lastFocus?.isConnected)lastFocus.focus();}
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target.closest('.close'))closeDialog(d);}));
$('#how').onclick=()=>openDialog('#help');
$('#glossary-open').onclick=()=>openDialog('#glossary');
$('#glossary-content').innerHTML=concepts.map(c=>`<article class="glossary-entry"><h3>${c.name}</h3><p>${c.text}</p><p class="muted"><strong>Por ejemplo:</strong> ${c.example}</p></article>`).join('');
$('#concept-list').innerHTML=concepts.map(c=>`<details open><summary>${c.name}</summary><p>${c.text}</p><p class="example"><strong>Por ejemplo:</strong> ${c.example}</p></details>`).join('');
$('#guidelines').innerHTML=guidelines.map((g,i)=>`<article class="guideline"><span class="number">0${i+1}</span><h3>${g[0]}</h3><p>${g[1]}</p></article>`).join('');
function normalize(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function contextHTML(){
 if(!course.trim()&&!profile.description.trim()&&!profile.activity.trim())return '<p>Comienza por describir tu asignatura y una actividad que quieras revisar.</p><a href="#curso">Describir mi curso →</a>';
 return `<h3>${esc(course||'Mi curso')}</h3>${profile.area?`<p><strong>Disciplina:</strong> ${esc(profile.area)}</p>`:''}${profile.audience?`<p><strong>Estudiantes:</strong> ${esc(profile.audience)}</p>`:''}${profile.description?`<p><strong>Propósitos y contenidos:</strong> ${esc(profile.description)}</p>`:''}${profile.activity?`<p><strong>Actividad de referencia:</strong> ${esc(profile.activity)}</p>`:''}${profile.goal?`<p><strong>Quisiera fortalecer:</strong> ${esc(profile.goal)}</p>`:''}<a href="#curso">Editar la descripción del curso →</a>`;
}
function refreshContext(){
 $('#selection-context').innerHTML=contextHTML();
 $('#map-course-context').textContent=course.trim()?`Estás explorando para: ${course}. Tu selección aparecerá en el paso 4, Relaciona y reflexiona.`:'Puedes consultar el mapa libremente. Para iniciar tu recorrido, describe tu curso en el paso 2.';
 $('#map-selection-link').textContent=`Ir a Mi selección (${Object.keys(selected).length}) →`;
}
function renderMap(){
 const dimensions=['Ética','Social y política','Formativa'];let total=0,visibleDimensions=0;
 $('#map-grid').innerHTML=dimensions.map((dimension,index)=>{
  const nodes=data.filter(d=>d.dimension===dimension&&(filter==='Todas'||filter===dimension)&&normalize([d.name,d.type,...d.items].join(' ')).includes(normalize(query)));
  total+=nodes.length;if(!nodes.length)return '';visibleDimensions++;
  return `<section class="dimension" style="--accent:#5454e9;--tint:${['color-mix(in srgb,#5454e9 7%,white)','color-mix(in srgb,#4cb979 10%,white)','color-mix(in srgb,#865cf0 8%,white)'][index]}"><h3 class="dimension-title"><span class="dimension-number">0${index+1}</span>${dimension}</h3><div class="branches">${nodes.map(d=>{const count=d.items.filter((_,j)=>selected[d.id+'-'+j]).length;return `<button class="node" data-node="${d.id}" aria-label="Explorar ${esc(d.name)}${count?', '+count+' aprendizajes seleccionados':''}"><span class="type">${esc(d.type)}</span><strong>${esc(d.name)}</strong><span class="node-bottom"><span>${d.items.length} aprendizajes${count?` · <span class="node-saved">${count}</span>`:''}</span><span aria-hidden="true">↗</span></span></button>`;}).join('')}</div></section>`;
 }).join('');
 $('#no-results').hidden=total>0;document.querySelector('.map-foot').firstElementChild.textContent=`${visibleDimensions} ${visibleDimensions===1?'dimensión':'dimensiones'} / ${total} ${total===1?'eje':'ejes'}`;
 document.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>showDetail(Number(b.dataset.node)));
}
function options(value){return `<option value=""${!value?' selected':''}>Sin seleccionar</option><option value="actual"${value==='actual'?' selected':''}>Lo trabajo en mi curso</option><option value="fortalecer"${value==='fortalecer'?' selected':''}>Quiero fortalecerlo</option>`;}
function showDetail(id){
 const d=data[id];$('#detail-dimension').textContent=d.dimension;
 const related=concepts.filter(c=>d.type.toLowerCase().includes(c.match));
 $('#detail-body').innerHTML=`<h2 id="detail-title">${esc(d.name)}</h2><span class="badge">${esc(d.type)}</span><p class="detail-description">${descriptions[id]}</p><div class="detail-concepts">${related.map(c=>`<p><strong>${c.name}.</strong> ${c.text}</p>`).join('')}</div>${course?`<p class="course-reference"><strong>Tu curso:</strong> ${esc(course)}</p>`:''}${profile.activity?`<details class="activity-reference"><summary>Recordar mi actividad de referencia</summary><p>${esc(profile.activity)}</p></details>`:''}<h3>Aprendizajes relacionados</h3><p class="small muted">Marca lo que trabajas o quieres fortalecer. Cada cambio se guarda automáticamente en Mi selección; después podrás explicar allí su relación con tu curso.</p>${d.items.map((item,j)=>`<label class="learning-row"><span>${esc(item)}</span><select data-learning="${id}-${j}" aria-label="${esc(item)} Estado en mi curso">${options(selected[id+'-'+j]?.status)}</select></label>`).join('')}<div class="question"><span>Para conectar con tu curso</span>${questions[id]}</div><div class="detail-actions"><p class="small muted" id="detail-save-status" role="status">Puedes seguir explorando o ir al paso 4 para escribir tu reflexión.</p><button class="primary" id="detail-selection">Continuar en Mi selección →</button></div>`;
 document.querySelectorAll('[data-learning]').forEach(s=>s.onchange=()=>{changeSelection(s.dataset.learning,s.value);$('#detail-save-status').textContent=s.value?'Guardado en Mi selección. Continúa allí para explicar la conexión con tu curso.':'Aprendizaje retirado de Mi selección.';});
 $('#detail-selection').onclick=()=>{closeDialog($('#detail'));navigate('seleccion');};openDialog('#detail');
}
function changeSelection(key,status){
 if(status){selected[key]={...(selected[key]||{}),status};toast('Guardado en Mi selección. Allí podrás explicar la conexión.');}else{delete selected[key];toast('Aprendizaje retirado de Mi selección.');}
 save();updateCount();renderMap();renderSelection();refreshContext();renderSummary();
}
function updateCount(){$('#count').textContent=Object.keys(selected).length;}
function renderSelection(){
 const keys=Object.keys(selected);$('#download').disabled=!keys.length;$('#print-selection').disabled=!keys.length;$('#clear').disabled=!keys.length;$('#review-summary').disabled=!keys.length;
 if(!keys.length){$('#selection-list').innerHTML='<div class="empty"><h2>Aún no has seleccionado aprendizajes.</h2><p>En el paso 3, abre un eje del mapa y marca «Lo trabajo en mi curso» o «Quiero fortalecerlo». Aparecerá aquí para que puedas relacionarlo con tus actividades.</p><a class="primary button" href="#mapa">Ir al mapa y seleccionar →</a></div>';return;}
 $('#selection-list').innerHTML=keys.map(key=>{
  const [i,j]=key.split('-').map(Number),d=data[i],s=selected[key];
  return `<article class="selection-card"><div class="selection-card-top"><span class="meta">${esc(d.dimension)} / ${esc(d.name)} · ${esc(d.type)}</span><select data-state="${key}" aria-label="Estado de ${esc(d.items[j])}">${options(s.status)}</select></div><h3>${esc(d.items[j])}</h3><p class="reflection-prompt">${questions[i]}</p><div class="reflection-grid"><label>¿Cómo lo relacionas con tu curso?<textarea rows="3" data-reflection="${key}" placeholder="Describe una actividad o situación de clase y explica la relación.">${esc(s.reflection||'')}</textarea></label><label>¿Qué podrías observar?<textarea rows="3" data-evidence="${key}" placeholder="Describe acciones, decisiones o producciones que te ayudarían a reconocer este aprendizaje.">${esc(s.evidence||'')}</textarea></label><label class="wide">¿Qué quisieras fortalecer y cómo lo intentarías?<textarea rows="3" data-plan="${key}" placeholder="Propón un ajuste en una actividad y un momento para revisar qué ocurrió.">${esc(s.plan||'')}</textarea></label></div><button class="text-button danger" data-remove="${key}">Quitar de mi selección ×</button></article>`;
 }).join('');
 document.querySelectorAll('[data-state]').forEach(s=>s.onchange=()=>changeSelection(s.dataset.state,s.value));
 document.querySelectorAll('[data-reflection],[data-evidence],[data-plan]').forEach(t=>t.oninput=()=>{const field=t.dataset.reflection?'reflection':t.dataset.evidence?'evidence':'plan',key=t.dataset.reflection||t.dataset.evidence||t.dataset.plan;selected[key][field]=t.value;save();renderSummary();});
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>changeSelection(b.dataset.remove,''));
}
function renderSummary(){
 const keys=Object.keys(selected);
 if(!keys.length){$('#summary-content').innerHTML='<div class="empty"><h2>Tu resumen comienza con una selección.</h2><p>Explora el mapa, marca aprendizajes y escribe tu reflexión en Mi selección.</p><a class="primary button" href="#mapa">Explorar y seleccionar →</a></div>';return;}
 const unfinished=keys.filter(k=>!selected[k].reflection?.trim()||!selected[k].evidence?.trim()||!selected[k].plan?.trim()).length;
 $('#summary-content').innerHTML=`<div class="course-context">${contextHTML()}</div><p class="summary-status">${keys.length} ${keys.length===1?'aprendizaje seleccionado':'aprendizajes seleccionados'}. ${unfinished?`${unfinished} ${unfinished===1?'tiene':'tienen'} campos de reflexión por completar. Puedes volver a editarlos o descargar un borrador.`:'Completaste los campos de reflexión de tu selección. Revisa sus conexiones antes de descargar.'}</p>`+keys.map(key=>{
  const [i,j]=key.split('-').map(Number),d=data[i],s=selected[key];
  return `<article class="summary-card"><p class="eyebrow">${esc(d.dimension)} / ${esc(d.name)}</p><h2>${esc(d.items[j])}</h2><p><strong>${s.status==='actual'?'Lo trabajo en mi curso':'Quiero fortalecerlo'}</strong> · ${esc(d.type)}</p><h3>Relación con mi curso</h3><p class="answer">${esc(s.reflection||'Por completar')}</p><h3>Qué podría observar</h3><p class="answer">${esc(s.evidence||'Por completar')}</p><h3>Qué quisiera fortalecer y cómo</h3><p class="answer">${esc(s.plan||'Por completar')}</p></article>`;
 }).join('');
}
$('#course').value=course;
$('#course').oninput=e=>{course=e.target.value;save();refreshContext();renderSummary();};
for(const key of Object.keys(profile)){$('#course-'+key).value=profile[key];$('#course-'+key).oninput=e=>{profile[key]=e.target.value;save();refreshContext();renderSummary();};}
$('#course-form').onsubmit=e=>{e.preventDefault();save();navigate('mapa');toast('Tu descripción está guardada. Ahora explora y selecciona aprendizajes.');};
$('#review-summary').onclick=()=>navigate('resumen');
$('#search').oninput=e=>{query=e.target.value;renderMap();};
document.querySelectorAll('[data-filter]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.filter===filter));b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderMap();};});
$('#clear').onclick=()=>openDialog('#confirm');
$('#confirm-clear').onclick=()=>{selected={};save();updateCount();renderSelection();renderMap();refreshContext();renderSummary();closeDialog($('#confirm'));toast('Selección borrada. La descripción de tu curso se conserva.');};
$('#assistant-open').onclick=()=>{$('#assistant-context').textContent=course?`Tu curso de referencia es ${course}. En esta demostración no se analiza esa descripción ni tu selección.`:'En la versión conectada, comenzarías describiendo tu curso y una actividad. Aquí puedes ver un ejemplo preparado.';$('#activity').value=profile.activity;$('#demo-result').hidden=true;openDialog('#assistant');};
$('#demo-run').onclick=()=>{$('#demo-result').hidden=false;$('#demo-result').scrollIntoView({behavior:'smooth',block:'nearest'});};
function reflectionText(){
 let text='MI REFLEXIÓN · EDUCACIÓN PARA LA PAZ\nUniversidad Icesi\nDecanatura de Innovación Educativa y Fortalecimiento del PEI\n\nCurso: '+(course||'Por completar')+'\n';
 const labels={area:'Área o disciplina',audience:'Estudiantes',description:'Propósitos y contenidos',activity:'Actividad de referencia',goal:'Qué quisiera fortalecer'};
 for(const key of Object.keys(profile))text+=labels[key]+': '+(profile[key]||'Por completar')+'\n';
 text+='\n';
 for(const key of Object.keys(selected)){const [i,j]=key.split('-').map(Number),d=data[i],s=selected[key];text+=d.dimension+' / '+d.name+' / '+d.type+'\n'+d.items[j]+'\nEstado: '+(s.status==='actual'?'Lo trabajo en mi curso':'Quiero fortalecerlo')+'\nRelación con mi curso: '+(s.reflection||'Por completar')+'\nQué podría observar: '+(s.evidence||'Por completar')+'\nQué quisiera fortalecer y cómo: '+(s.plan||'Por completar')+'\n\n';}
 return text+'Esta reflexión no certifica el desarrollo de aprendizajes. La herramienta no la envía al equipo del proyecto.\nSubvención CA06130105 - Lineamientos pedagógicos éticos en educación para la paz\n';
}
$('#download').onclick=()=>{const url=URL.createObjectURL(new Blob(['\ufeff'+reflectionText()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mi-reflexion-educacion-para-la-paz.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Reflexión descargada. Puedes volver a editarla cuando quieras.');};
function navigate(hash){if(location.hash==='#'+hash)route();else location.hash=hash;}
function route(){
 const hash=location.hash.slice(1),page=['curso','orientaciones','seleccion','resumen'].includes(hash)?hash:'explorar';
 document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==page);
 document.querySelectorAll('header nav a').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const step=hash==='mapa'?'mapa':page;
 document.querySelectorAll('[data-step]').forEach(a=>{if(a.dataset.step===step)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 if(page==='resumen')renderSummary();
 refreshContext();
 if(hash==='mapa')requestAnimationFrame(()=>$('#mapa').scrollIntoView());else window.scrollTo(0,0);
 document.title=({curso:'Mi curso',seleccion:'Mi selección',resumen:'Mi resumen',orientaciones:'Orientaciones'}[page]||'Mapa de capacidades')+' · Icesi';
}
window.addEventListener('hashchange',route);
function buildPrint(){
 const labels={area:'Área o disciplina',audience:'Estudiantes',description:'Propósitos y contenidos',activity:'Actividad de referencia',goal:'Qué quisiera fortalecer'};
 $('#print-content').innerHTML=`<h1>Mi reflexión</h1><p>Universidad Icesi · Educación para la paz</p><p>Decanatura de Innovación Educativa y Fortalecimiento del PEI</p><h2>${esc(course||'Mi curso')}</h2>`+Object.keys(profile).map(k=>`<p><strong>${labels[k]}:</strong> ${esc(profile[k]||'Por completar')}</p>`).join('')+Object.keys(selected).map(key=>{const [i,j]=key.split('-').map(Number),d=data[i],s=selected[key];return `<article class="print-card"><p>${esc(d.dimension)} / ${esc(d.name)} · ${esc(d.type)}</p><h2>${esc(d.items[j])}</h2><p><strong>Estado:</strong> ${s.status==='actual'?'Lo trabajo en mi curso':'Quiero fortalecerlo'}</p><h3>Relación con mi curso</h3><p>${esc(s.reflection||'Por completar')}</p><h3>Qué podría observar</h3><p>${esc(s.evidence||'Por completar')}</p><h3>Qué quisiera fortalecer y cómo</h3><p>${esc(s.plan||'Por completar')}</p></article>`;}).join('')+'<p>Esta reflexión no certifica el desarrollo de aprendizajes. No se envía al equipo del proyecto.</p><p>Subvención CA06130105 · Lineamientos pedagógicos éticos en educación para la paz</p>';
}
$('#print-selection').onclick=()=>{buildPrint();window.print();};
window.addEventListener('beforeprint',buildPrint);
fetch('data.json').then(r=>{if(!r.ok)throw new Error('data');return r.json();}).then(items=>{
 data=items;
 for(const key of Object.keys(selected)){const [i,j]=key.split('-').map(Number);if(!/^\d+-\d+$/.test(key)||!data[i]?.items[j]||!['actual','fortalecer'].includes(selected[key]?.status)){delete selected[key];continue;}for(const field of ['reflection','evidence','plan'])if(typeof selected[key][field]!=='string')selected[key][field]='';}
 updateCount();renderMap();renderSelection();refreshContext();renderSummary();route();if(!storageAvailable){$('#save-status').textContent='Este navegador no permite guardar. Descarga tu reflexión antes de salir.';$('#course-save-status').textContent=$('#save-status').textContent;}
}).catch(()=>{$('#map-grid').innerHTML='<p>No pudimos cargar el mapa. Actualiza la página para intentarlo nuevamente.</p>';});
