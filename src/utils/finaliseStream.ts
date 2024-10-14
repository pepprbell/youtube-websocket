import type { ServerWebSocket } from "bun";
import { innertube } from "./youtube";
import { YTNodes } from "youtubei.js/web";

import { textMessageToJSON } from "../adapters/textMessage";
import { paidMessageToJSON } from "../adapters/paidMessage";

/** Someone please open a fucking PR to find a better name for this. It's 1AM and I can't think of shit. */
export async function finaliseStream(streamId: string, ws: ServerWebSocket) {
    const youtube = await innertube()

    const streamInfo = await youtube.getInfo(streamId)
    const liveChat   = streamInfo.getLiveChat()
    
    if (!liveChat) return ws.close(1000, 'Requested content has no available live chat')
        
    liveChat.on('chat-update', action => {
        if (ws.readyState > 1) return liveChat.stop();
        if (!action.is( YTNodes.AddChatItemAction )) return
            
        const item = action.as(YTNodes.AddChatItemAction).item
    
        if (!item) return
    
        const searchParams = new URL(ws.data.url).searchParams

        switch(item.type) {
            case 'LiveChatTextMessage':
                ws.send(textMessageToJSON(
                    item.as(YTNodes.LiveChatTextMessage)
                ))
            break;

            case 'LiveChatPaidMessage':
                if (searchParams.get('includeSuperchat') !== 'true') return;

                ws.send(paidMessageToJSON(
                    item.as(YTNodes.LiveChatPaidMessage)
                ))
            break;
        }
    })
    
    liveChat.on('end', () => {
        ws.close(1000, 'Requested content\'s live chat has ended')
        return liveChat.stop()
    })
    
    liveChat.start()
}