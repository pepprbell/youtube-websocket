import type { ServerWebSocket } from "bun";
import { innertube } from "./youtube";

/** Someone please open a fucking PR to find a better name for this. It's 1AM and I can't think of shit. */
export async function sendInfo(streamId: string, ws: ServerWebSocket) {
    const youtube = await innertube()

    let streamInfo
    let liveChat = false
    try {
        streamInfo = await youtube.getInfo(streamId)
        liveChat   = streamInfo.getLiveChat()
    } catch (error) {
        return ws.close(1000, 'error') 
    }

    if (!liveChat) return ws.close(1000, 'Requested content has no available live chat')

    liveChat.on('start', contents => {
        const view_count = streamInfo.primary_info.view_count.runs[0]?.text
        ws.send(parseInt(view_count.replace(/,/g, "")))
    })

    setInterval(() => {
        sendViews()
    }, 30*1000) // 30초에 한번 업데이트

    const sendViews = async () => {
        let streamInfo = await youtube.getInfo(streamId)
        let view_count = '0'
        try {
            view_count = streamInfo.primary_info.view_count.runs[0]?.text
        } catch {
            view_count = '0'
        }
        ws.send(parseInt(view_count.replace(/,/g, "")))
    }

    liveChat.on('end', () => {
        ws.close(1000, 'Requested content\'s live chat has ended')
        return liveChat.stop()
    })
    
    liveChat.start()
}