import { db } from "../libs/db.js";


export const createPlaylist = async (req, res) => {
    //accept the required details from req.body
    const {name, description} = req.body;

    const userId = req.user.id;

    //Create playlist
    
    
    try {
        const playlist = await db.playlist.create({
            data:{
                name,
                description,
                userId,
            }
        });

        res.status(200).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        })
        
    } catch (error) {
        console.error("Error creating playlist", error);
        res.status(500).json({
            error: "error creating playlist",
        })
        
        
    }
    
    
}

export const getAllListDetails = async (req, res) => {

    try {
        const playlists = await db.playlist.findMany({
            where:{
                userId: req.user.id

            },
            include:{
                problem:{
                    include:{
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message:"Playlist details fetched successfully",
            playlists
        })

    } catch (error) {
        console.error("Error fetching playlists", error);
        res.status(500).json({
            error: "Error fetching playlists"
        })
        
        
    }

}

export const getPlaylist = async (req, res)=>{

    const {playlistId} = req.params;

    try {
        const playlist = await db.playlist.findUnique({
            where:{
                id:playlistId,
                userId: req.user.id,

            },
            include:{
                problems:{
                    include:{
                        problem: true
                    }
                }
            }
        })

        if(!playlist){
            return res.status(404).json({
                error: "Playlist not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            playlist,
        })

        
    } catch (error) {
        console.error("Error fetching playlist:", error);
        res.status(500).json({
            error: "Error fetching playlist"
        })
        
        
    }

}

export const addProblemToPlaylist = async (req, res) => {
    const {playlistId} = req.params;
    const {problemIds} = req.body;

    try {
        if(!Array.isArray(problemIds) || problemIds.length==0){
            return res.status(400).json({error:"Invaild or missing problem id(s)"});
        }

        //create records for each problem in the playlist
        const problemsInPlaylist = await db.problemInPlaylist.createMany({
            data: problemIds.map((problemId)=>({
                playlistId,
                problemId

            }))
        })

        res.status(201).json({
            success: true,
            message: "Problems added to playlist successfully",
            problemsInPlaylist,
        })

    } catch (error) {
        console.error("Error adding problem(s) to playlist", error);
        res.status(500).json({
            error: "Error adding problem(s) in playlist",
        })
        
        
    }

}

export const deletePlaylist = async (req, res) => {
    const {playlistId} = req.params;
    
    try {
        const deletedPlaylist = await db.playlist.delete({
            where:{
                id: playlistId,
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            deletePlaylist,
        })

    } catch (error) {
        console.error("Error deleting playlist", error);
        res.status(500).json({
            error: "Error deleting playlist",
        })
        
        
    }


}


export const removeProblemFromPlaylist = async (req, res) => {

    const {playlistId} = req.params;
    const {problemIds} = req.body;

    try {
        if(!Array.isArray(problemIds) || problemIds.length == 0){
            return res.status(400).json({error:"Invaild or missing problem id(s)"});
        }


        const deletedProblem = await db.problemsInPlaylist.deletMany({
            where:{
                playlistId,
                problemId:{
                    in: problemIds
                }

            }
        });
        
        res.status(200).json({
            success: true,
            message: "Problem removed from playlist successfully",
            deletedProblem,
        });

    } catch (error) {
        console.error("Error deleting problem(s) from playlist", error);
        res.status(500).json({
            error: "Error deleting problem(s) from playlist",
        })
        
    }

}

