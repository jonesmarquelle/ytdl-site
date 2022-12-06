import youtubeDl from "youtube-dl-exec";
import { z } from "zod";
import { FileType } from "../../../pages";

import { router, publicProcedure } from "../trpc";

export const videoRouter = router({
  getVideo: publicProcedure
    .input(z.object({
      url: z.string(),
      fileType: z.nativeEnum(FileType).nullish(),
      startTime: z.string().default("00:00"),
      endTime: z.string().default("inf"),
    }).nullish())
    .query(async ({ input }) => {
      if (!input) return { res: null };
      if (!input.fileType) input.fileType = FileType.mp4;
      const videoFile = input.fileType == FileType.mp4;
      const audioFile = input.fileType == FileType.mp3;

      const flags: Record<string, unknown> = {
        maxFilesize: "50M",
        downloadSections: [`*${input.startTime}-${input.endTime}`],
        forceKeyframesAtCuts: true,
        output: "download.mp4",
     //   dumpJson: true,
      }

      if (audioFile) {
        flags.extractAudio = true;
        flags.audioFormat = input.fileType
      } else if (videoFile) {
        flags.format = input.fileType
      }

      const res = await youtubeDl(input.url, flags);
      return {
        res 
      };
    }),
});
