import type { ServerWebSocket } from "bun";
import { innertube } from "../utils/youtube";
import { sendInfo } from "../utils/sendInfo";

export async function getChannelInfo(ws : ServerWebSocket) {
    if (!ws.data.params.id) return ws.close(1000, 'Please specify a valid channel identifier')

    const niceId = /^UC.{22}$/.test(ws.data.params.id) ? ws.data.params.id : '@' + ws.data.params.id.replace('@','')

    const youtube  = await innertube()
    const streamData = await youtube.resolveURL(`https://www.youtube.com/${niceId}/live`).catch(() => { return null })

    if (!streamData?.payload?.videoId) return ws.close(1000, 'Could not find stream by channel identifier')

    sendInfo(streamData.payload.videoId, ws)
}