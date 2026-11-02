const STORAGE_KEY = 'innovationTrackerProjectsV1';
const starterProjects = [
  {id:'p1',name:'Smart Campus Innovation Hub',description:'A centralized platform to organize student innovation ideas and project activities.',team:'Team Alpha',date:'2026-11-20',status:'In Progress',progress:65},
  {id:'p2',name:'Green Energy Monitoring',description:'Track energy-saving initiatives and monitor sustainability outcomes.',team:'Team Eco',date:'2026-12-05',status:'Planning',progress:20},
  {id:'p3',name:'Community Problem Solver',description:'Coordinate ideas and tasks for projects addressing local community needs.',team:'Team Impact',date:'2026-10-28',status:'Completed',progress:100}
];
let projects = loadProjects();
const $ = id => document.getElementById(id);
function loadProjects(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):starterProjects}catch{return starterProjects}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(projects));render()}
function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
  $('totalCount').textContent=projects.length;
  $('activeCount').textContent=projects.filter(p=>p.status==='In Progress').length;
  $('completedCount').textContent=projects.filter(p=>p.status==='Completed').length;
  $('averageProgress').textContent=(projects.length?Math.round(projects.reduce((s,p)=>s+Number(p.progress),0)/projects.length):0)+'%';
  const q=$('searchInput').value.toLowerCase(), status=$('statusFilter').value;
  const visible=projects.filter(p=>(status==='All'||p.status===status)&&[p.name,p.description,p.team].join(' ').toLowerCase().includes(q));
  $('projectList').innerHTML=visible.length?visible.map(p=>`
    <article class="project-card">
      <div class="card-top"><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||'No description added.')}</p></div><span class="status ${p.status.toLowerCase().replaceAll(' ','-')}">${escapeHTML(p.status)}</span></div>
      <div class="progress-row"><span>Project progress</span><strong>${Number(p.progress)}%</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(p.progress)))}%"></div></div>
      <div class="card-bottom"><span>◉ ${escapeHTML(p.team)} &nbsp; · &nbsp; ${p.date?new Date(p.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'No target date'}</span><div class="card-actions"><button class="small-btn" data-edit="${p.id}">Edit</button><button class="small-btn" data-delete="${p.id}">Delete</button></div></div>
    </article>`).join(''):`<div class="empty"><strong>No projects found</strong>Try changing your search or add a new project.</div>`;
}
function openForm(project){
  $('projectForm').reset();$('projectId').value=project?.id||'';
  $('dialogTitle').textContent=project?'Edit project':'Add a project';
  $('projectName').value=project?.name||'';$('projectDescription').value=project?.description||'';
  $('projectTeam').value=project?.team||'';$('projectDate').value=project?.date||'';
  $('projectStatus').value=project?.status||'Planning';$('projectProgress').value=project?.progress??0;
  $('projectDialog').showModal();
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
$('openFormBtn').addEventListener('click',()=>openForm());
$('closeDialog').addEventListener('click',()=>$('projectDialog').close());
$('cancelBtn').addEventListener('click',()=>$('projectDialog').close());
$('searchInput').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
$('projectList').addEventListener('click',e=>{
  const edit=e.target.dataset.edit, del=e.target.dataset.delete;
  if(edit){const p=projects.find(x=>x.id===edit);if(p)openForm(p)}
  if(del&&confirm('Delete this project?')){projects=projects.filter(x=>x.id!==del);save();toast('Project deleted')}
});
$('projectForm').addEventListener('submit',e=>{
  e.preventDefault();
  const id=$('projectId').value, progress=Math.max(0,Math.min(100,Number($('projectProgress').value)||0));
  let status=$('projectStatus').value;if(progress===100)status='Completed';
  const item={id:id||'p'+Date.now(),name:$('projectName').value.trim(),description:$('projectDescription').value.trim(),team:$('projectTeam').value.trim(),date:$('projectDate').value,status,progress};
  if(!item.name||!item.team)return;
  if(id)projects=projects.map(p=>p.id===id?item:p);else projects.unshift(item);
  save();$('projectDialog').close();toast(id?'Project updated':'Project added successfully');
});
render();
