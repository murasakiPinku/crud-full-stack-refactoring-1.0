<?php
/**
*    File        : backend/models/students.php
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 2.0 ( prototype )
*/

function getAllStudents($conn) 
{
    $sql = "SELECT * FROM students";

    //MYSQLI_ASSOC devuelve un array ya listo para convertir en JSON:
    return $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
}

//2.0
function getPaginatedStudents($conn, $limit, $offset) 
{
    $stmt = $conn->prepare("SELECT * FROM students LIMIT ? OFFSET ?");
    $stmt->bind_param("ii", $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

//2.0
function getTotalStudents($conn) 
{
    $sql = "SELECT COUNT(*) AS total FROM students";
    $result = $conn->query($sql);
    return $result->fetch_assoc()['total'];
}

function getStudentById($conn, $id) 
{
    $stmt = $conn->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    //fetch_assoc() devuelve un array asociativo ya listo para convertir en JSON de una fila:
    return $result->fetch_assoc(); 
}

function createStudent($conn, $fullname, $email, $age) 
{
    $sql = "INSERT INTO students (fullname, email, age) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $fullname, $email, $age);

    //3.2
    if (!$stmt->execute()){ //verifico si esta ejecucion fallo
        if ($conn->errno==1062){ //Si el error es por Duplicate entry me devuelve el codigo 1062 
            return [
                'inserted'=> 0,
                'error'=> 'Hubo un error: el correo electronico que se ingreso ya existe'
            ];
        }
        return [ //si es otro error
            'inserted'=>0,
            'error'=>$stmt->error
        ];
        }

    //3.2
    if (!$stmt->execute()){ //verifico si esta ejecucion fallo
        if ($conn->errno==1062){ //Si el error es por Duplicate entry me devuelve el codigo 1062 
            return [
                'inserted'=> 0,
                'error'=> 'Hubo un error: el correo electronico que se ingreso ya existe'
            ];
        }
        return [ //si es otro error
            'inserted'=>0,
            'error'=>$stmt->error
        ];
        }

    //Se retorna un arreglo con la cantidad de filas insertadas 
    //y el id insertado para validar en el controlador:
    return 
    [
        'inserted' => $stmt->affected_rows,        
        'id' => $conn->insert_id
    ];
}

function updateStudent($conn, $id, $fullname, $email, $age) 
{
    $sql = "UPDATE students SET fullname = ?, email = ?, age = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssii", $fullname, $email, $age, $id);
    $stmt->execute();

    //Se retorna fila afectadas para validar en controlador:
    return ['updated' => $stmt->affected_rows];
}

//3.1
function deleteStudent($conn, $id) 
{
    //PRIMERO VERIFICO QUE NO HAYAN FILAS QUE TIENEN EN LA RELACION AL ESTUDIANTE
    $checkSql = "SELECT COUNT(*) AS count FROM students_subjects WHERE student_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result()->fetch_assoc();

    if ($result['count'] > 0) { //HAY ALMENOS UNA RELACION!, NO BORRAR!
        return ['deleted' => 0,
                'error' => 'No se pudo eliminar al estudiante, tiene materias asignadas.'];
    }else{                      //NO HAY RELACIONES, BORRAR!
        $sql = "DELETE FROM students WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        //Se retorna fila afectadas para validar en controlador
        return ['deleted' => $stmt->affected_rows];
    }
}


?>