import PlusIcon from "../icons/PlusIcon"
import React, { useMemo , useState} from 'react';
import { Column , Id, Task} from "../types";
import ColumnContainer from "./ColumnContainer";
import {DndContext, DragStartEvent , DragOverlay, DragEndEvent, useSensor, useSensors, PointerSensor} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from 'react-dom';

function KanbanBoard(){
    const [columns,setColumns]=useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [activateColumn , setActivateColumn] = useState<Column | null>(null);
    const [tasks , setTasks] = useState<Task[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            }
        })
    )
    return(
        <div className="
            m-auto
            flex
            min-h-screen
            w-full
            items-center
            overflow-x-auto
            overflow-y-hidden
            px-[40px]">
            <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col)=>(
                                <ColumnContainer 
                                key={col.id}
                                column={col} 
                                deleteColumn={deleteColumn} 
                                updateColumn={updateColumn} 
                                createTask={createTask}
                                tasks={tasks.filter((tasks) => tasks.columnId=== col.id)}
                            />
                            ))}
                        </SortableContext>
                    </div>
                            
                    <button className="
                    h-[60px]
                    w-[350px]
                    min-w-[350px]
                    cursor-pointer
                    rounded-lg
                    bg-mainBackgroundColor
                    border-2
                    border-columnBackgroundColor
                    p-4
                    ring-rose-500
                    hover:ring-2
                    flex
                    gap-2
                    " 
                    onClick={()=>{
                        createNewColumn();
                    }}><PlusIcon/>Add Column</button>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activateColumn && (
                        <ColumnContainer 
                        column={activateColumn} 
                        deleteColumn={deleteColumn}
                        updateColumn={updateColumn}
                        createTask={createTask}
                        />)
                        }
                    </DragOverlay>, 
                    document.body
                )}
            </DndContext>
        </div>
    )
    function createTask(columnId: Id){
        const newTask: Task = {
            id: generatedId(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };
        setTasks([...tasks,newTask]);
    }
    function createNewColumn(){
        const columnToAdd: Column = {
            id: generatedId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd])
    }
    function deleteColumn(id: Id){
        const filteredColumns = columns.filter((col)=> col.id !== id);
        setColumns(filteredColumns);
    }
    function updateColumn(id: Id , title: string){
        const newColumns = columns.map((col) => {
            if(col.id !== id) return col;
            return {...col, title };
        });
        setColumns(newColumns);
    }
    function onDragStart(event: DragStartEvent){
        if(event.active.data.current?.type==="Column"){
            setActivateColumn(event.active.data.current.column);
            return;
        }
    }
    function onDragEnd(event: DragEndEvent){
        const { active , over } = event;
        if(!over) return;
        const activeColumnId = active.id;
        const overColumnId = over.id;
        if(activeColumnId === overColumnId) return;

        setColumns(columns => {
            const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId);
            const overColumnIndex = columns.findIndex(col => col.id === overColumnId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        })
    }
}
function generatedId(){
    //Genereted a random number betwen 0 and 10000
    return Math.floor(Math.random()*10001);
}
export default KanbanBoard