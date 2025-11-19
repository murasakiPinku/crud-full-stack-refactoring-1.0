<?php
/**
*    File        : backend/models/subjects.php
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

function getAllSubjects($conn) 
{
    $sql = "SELECT * FROM subjects";

    return $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
}

//2.0
function getPaginatedSubjects($conn, $limit, $offset) 
{
    $stmt = $conn->prepare("SELECT * FROM subjects LIMIT ? OFFSET ?");
    $stmt->bind_param("ii", $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

//2.0
function getTotalSubjects($conn) 
{
    $sql = "SELECT COUNT(*) AS total FROM subjects";
    $result = $conn->query($sql);
    return $result->fetch_assoc()['total'];
}

function getSubjectById($conn, $id) 
{
    $sql = "SELECT * FROM subjects WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    return $result->fetch_assoc(); 
}

function createSubject($conn, $name) 
{
    $sql = "INSERT INTO subjects (name) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $name);

    // 3.3 TREJO
    
    if (!$stmt->execute())  //si la ejecución falló, entonces, ingreso
        { 
            if ($conn->errno==1062) //Si el error es por entrada duplicada me devuelve el codigo 1062
                { 
                    return 
                        [
                            'inserted'=> 0,
                            'error'=> 'Hubo un error: La materia que se ingreso ya existe'
                        ];
                }
            return //si es otro error
                [ 
                    'inserted'=>0,
                    'error'=>$stmt->error
                ];
        }    


    return 
        [
            'inserted' => $stmt->affected_rows,        
            'id' => $conn->insert_id
        ];
}

function updateSubject($conn, $id, $name) 
{
    $sql = "UPDATE subjects SET name = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $name, $id);
    $stmt->execute();

    return ['updated' => $stmt->affected_rows];
}

//3.4

function deleteSubject($conn, $id) 
{
    $check_sql = "SELECT subject_id FROM students_subjects WHERE subject_id = ? LIMIT 1"; //busco el id de la materia en la tabla de relaciones

    $check_stmt = $conn->prepare($check_sql); // obtengo de forma segura la query 
    $check_stmt->bind_param("i", $id); // reemplaza el ? con el entero id
    $check_stmt->execute(); //genera los resultados y los guarda
    
    $result = $check_stmt->get_result(); //obtiene los resultados generados anteriormente
    
    if ($result->num_rows > 0) { // si encuentra el id en la tabla de relaciones
        return [ 
            'error' => true, // creo una variable booleana error y le asigno true 
            'message' => "Error: No se puede borrar la materia, está asignada a estudiantes." //variable string
        ];
    }
    
    $sql = "DELETE FROM subjects WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();

    return ['deleted' => $stmt->affected_rows];
}
?>
