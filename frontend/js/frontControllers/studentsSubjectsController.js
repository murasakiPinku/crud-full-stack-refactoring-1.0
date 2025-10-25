/**
*    File        : frontend/js/controllers/studentsSubjectsController.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

import { studentsAPI } from '../apiConsumers/studentsAPI.js';
import { subjectsAPI } from '../apiConsumers/subjectsAPI.js';
import { studentsSubjectsAPI } from '../apiConsumers/studentsSubjectsAPI.js';

//2.0
//For pagination:
let currentPage = 1;
let totalPages = 1;
const limit = 5;

document.addEventListener('DOMContentLoaded', () => 
{
    initSelects();
    setupFormHandler();
    setupCancelHandler();
    loadRelations();
    setupPaginationControls();//2.0
});

async function initSelects() 
{
    try 
    {
        // Cargar estudiantes
        const students = await studentsAPI.fetchAll();
        const studentSelect = document.getElementById('studentIdSelect');
        students.forEach(s => 
        {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.fullname;
            studentSelect.appendChild(option);
        });

        // Cargar materias
        const subjects = await subjectsAPI.fetchAll();
        const subjectSelect = document.getElementById('subjectIdSelect');
        subjects.forEach(sub => 
        {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            subjectSelect.appendChild(option);
        });
    } 
    catch (err) 
    {
        console.error('Error cargando estudiantes o materias:', err.message);
    }
}

function setupFormHandler() 
{
    const form = document.getElementById('relationForm');
    form.addEventListener('submit', async e => 
    {
        e.preventDefault();

        const relation = getFormData();

        try 
        {
            if (relation.id) 
            {
                await studentsSubjectsAPI.update(relation);
            } 
            else 
            {
                await studentsSubjectsAPI.create(relation);
            }
            clearForm();
            loadRelations();
        } 
        catch (err) 
        {
            console.error('Error guardando relación:', err.message);
        }
    });
}

function setupCancelHandler()
{
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => 
    {
        document.getElementById('relationId').value = '';
    });
}

//2.0
function setupPaginationControls() 
{
    document.getElementById('prevPage').addEventListener('click', () => 
    {
        if (currentPage > 1) 
        {
            currentPage--;
            loadRelations();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => 
    {
        if (currentPage < totalPages) 
        {
            currentPage++;
            loadRelations();
        }
    });

    document.getElementById('resultsPerPage').addEventListener('change', e => 
    {
        currentPage = 1;
        loadRelations();
    });
}

function getFormData() 
{
    return{
        id: document.getElementById('relationId').value.trim(),
        student_id: document.getElementById('studentIdSelect').value,
        subject_id: document.getElementById('subjectIdSelect').value,
        approved: document.getElementById('approved').checked ? 1 : 0
    };
}

function clearForm() 
{
    document.getElementById('relationForm').reset();
    document.getElementById('relationId').value = '';
}

/*
async function loadRelations() 
{
    try 
    {
        const relations = await studentsSubjectsAPI.fetchAll();
        
        relations.forEach(rel => 
        {
            rel.approved = Number(rel.approved);
        });
        
        renderRelationsTable(relations);
    } 
    catch (err) 
    {
        console.error('Error cargando inscripciones:', err.message);
    }
}
*/

//2.0

async function loadRelations()
{
    try 
    {
        const resPerPage = parseInt(document.getElementById('resultsPerPage').value, 10) || limit;
        const data = await studentsSubjectsAPI.fetchPaginated(currentPage, resPerPage);
        
        data.relations.forEach(rel => 
        {
            rel.approved = Number(rel.approved);
        });
        
        console.log(data);
        renderRelationsTable(data.relations);
        totalPages = Math.ceil(data.total / resPerPage);
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    } 
    catch (err) 
    {
        console.error('Error cargando relaciones:', err.message);
    }
}

function renderRelationsTable(relations) 
{
    const tbody = document.getElementById('relationTableBody');
    tbody.replaceChildren();

    relations.forEach(rel => 
    {
        const tr = document.createElement('tr');

        tr.appendChild(createCell(rel.student_fullname));
        tr.appendChild(createCell(rel.subject_name));
        tr.appendChild(createCell(rel.approved ? 'Sí' : 'No'));
        tr.appendChild(createActionsCell(rel));

        tbody.appendChild(tr);
    });
}

function createCell(text) 
{
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

function createActionsCell(relation) 
{
    const td = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'w3-button w3-blue w3-small';
    editBtn.addEventListener('click', () => fillForm(relation));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Borrar';
    deleteBtn.className = 'w3-button w3-red w3-small w3-margin-left';
    deleteBtn.addEventListener('click', () => confirmDelete(relation.id));

    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    return td;
}

function fillForm(relation) 
{
    document.getElementById('relationId').value = relation.id;
    document.getElementById('studentIdSelect').value = relation.student_id;
    document.getElementById('subjectIdSelect').value = relation.subject_id;
    document.getElementById('approved').checked = !!relation.approved;
}

async function confirmDelete(id) 
{
    if (!confirm('¿Estás seguro que deseas borrar esta inscripción?')) return;

    try 
    {
        await studentsSubjectsAPI.remove(id);
        loadRelations();
    } 
    catch (err) 
    {
        console.error('Error al borrar inscripción:', err.message);
    }
}
