import {Response} from "express";

function AppResponse (res:Response, message:string, statusCode:number = 200, data:any = null) {
    let status;
    switch (statusCode) {
        case (statusCode = 200):
            status ="ok";
            break;
        case (statusCode = 201):
            status = "Created";
            break;
        case (statusCode = 202):
            status = "Accepted";
            break;
        case (statusCode = 203):
            status = "Non-Authoritative Information";
            break;
        case (statusCode = 204):
            status = "No Content";
            break;
        case (statusCode = 205):
            status = "Reset Content";
            break;
        case (statusCode = 206):
            status = "Partial Content";
            break;
    };
    res.status(statusCode).json({status:status, message:message, data:data})
    
}
export default AppResponse