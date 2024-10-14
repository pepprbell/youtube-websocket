import { Elysia, error, t } from 'elysia';

import { getChannel } from './routes/channel';
import { getStream } from './routes/stream';
import { getChannelInfo } from './routes/channelInfo';

new Elysia()
    .ws('/c/:id', { open: getChannel })
    .ws('/s/:id', { open: getStream  })
    .ws('/n/:id', { open: getChannelInfo })
    .listen({
        port: process.env.PORT || 9905,
        hostname: '0.0.0.0'
    })