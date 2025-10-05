import type { UserNote } from "types";
import  { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

type NoteCardProp = {
	userNote: UserNote;
};

const NoteCard=({userNote}:NoteCardProp)=>{



    return (
     <Card>
<CardHeader>
<CardTitle>
    {userNote.note.title}
</CardTitle>
</CardHeader>
<CardContent></CardContent>
<CardFooter></CardFooter>


     </Card>
    );
}

export default NoteCard;
