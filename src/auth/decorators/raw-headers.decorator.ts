import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data: string, ctx:ExecutionContext )=> {

        const req = ctx.switchToHttp().getRequest();
        const rawHeaders = req.rawHeaders;
        console.log("🚀 ~ file: get-rawheaders.decorator.ts:8 ~ rawHeaders:", rawHeaders)

        if(!rawHeaders)
            throw new InternalServerErrorException('RawHeaders not found (request)');

        return ( !data ? rawHeaders : rawHeaders[data] );
    }
);