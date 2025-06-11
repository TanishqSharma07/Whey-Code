import axios from "axios";


export const getJudge0LanguageId = (language)=>{
    const langMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "CPP": 54,
    }

    return langMap[language.toUpperCase()] || null;
}


export const submitBatch = async (submissions)=>{
    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
        submissions
    });

    return data;

}

const sleep = (ms)=>{
    return new Promise((resolve)=> setTimeout(resolve, ms))
}

export const pollBatchResults = async (tokens)=>{


    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens: tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions;

        const isAllDone = results.every((r)=>{
            return r.status.id >=3
        })

        if(isAllDone) return results;

        await sleep(1000);


    }

}


export const getLanguageName= (langaugeId)=>{
    const LANGUAGE_NAMES = {
        63: "JavaScript",
        71: "Python",
        54: "CPP",
    }

    return LANGUAGE_NAMES[langaugeId] || "Unknown";

}