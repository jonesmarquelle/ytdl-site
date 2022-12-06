import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CloseIcon from "../components/CloseIcon";
import DownloadIcon from "../components/DownloadIcon";
import TimeInput from "../components/TimeInput";
import { trpc } from "../utils/trpc";

export enum FileType {
  mp3 = "mp3",
  mp4 = "mp4",
}

interface DLRequest {
  url: string,
  fileType?: FileType,
  startTime?: string,
  endTime?: string
}

const Home: NextPage = () => {
  const [ loaded, setLoaded ] = useState(false);
  const [ showVideo, setShowVideo ] = useState(false);
  const [ showDownload, setShowDownload ] = useState(false);
  const [ url, setUrl ] = useState<string>();
  const [ valid, setValid ] = useState<boolean>(true);

  const [ startTime, setStartTime ] = useState<string>();
  const [ endTime, setEndTime ] = useState<string>();

  const [ embedTimeStampURL, setEmbedTimeStampURL ] = useState<string>();

  const timeInSecs = (timeString?: string) => {
    if (!timeString) return "null";
    const timeArr = timeString.split(':')
    if (timeArr.reduce((prev, curr) => {return (prev || !curr)}, false)) return undefined
    return timeArr.reduce((prev, curr) => {return prev * 60 + Number.parseInt(curr)}, 0)
}

  useEffect(() => {
    if (!url) return;
    const embedUrl = (url: string) => `${url.replace("watch?v=", "embed/")}`;
    const timestampUrl = (url: string) => `${url}?start=${timeInSecs(startTime) ?? 0}&end=${timeInSecs(endTime) ?? 0}`;
    setEmbedTimeStampURL(timestampUrl(embedUrl(url)))
  }, [startTime, endTime, url])

  const [ req, setReq ] = useState<DLRequest>();
  const video = trpc.video.getVideo.useQuery(req);
  const [ videoDownloaded, setVideoDownloaded ] = useState<boolean>();
  const [ fileType, setFileType ] = useState<FileType>();
  const [ filePath, setFilePath ] = useState<string>(`./download.${fileType}`);

  useEffect(() => {
    setFilePath(`download.${fileType}`)
  }, [fileType, videoDownloaded])

  useEffect(() => {
    if (video.data?.res) {
      setVideoDownloaded(true);
    } else {
      setVideoDownloaded(false);
    }
  }, [video.data]);

  const handleCloseClick = () => {
    setUrl(undefined);
    setReq(undefined);
    setValid(true);
    setLoaded(false);
    setVideoDownloaded(false);
    setShowDownload(false);
    setShowVideo(false);
  }

  const handleSubmitURL = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) {
      setValid(false);
      return;
    }
    setValid(true);
    setLoaded(true);
  }

  const handleURLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
  }

  const handleConfirmDownload = (type: FileType) => {
    if (!url) return;
    setFileType(type);
    setReq({url, fileType: type, startTime, endTime});//startTime, endTime});
  }

  return (
    <>
      <Head>
        <title>Youtube Downloader</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center bg-left">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <p className="text-4xl md:text-5xl transition-all text-slate-400 font-thin tracking-tighter"><strong>YouTube</strong> Downloader</p>
            <form onSubmit={handleSubmitURL} className="w-full max-w-2xl container flex flex-col items-center gap-4">
              <div onTransitionEnd={() => setShowVideo(true)} className={`${!valid && 'border-pink-500'} ${loaded ? (showDownload ? "aspect-video" : "h-[56vh]") : "h-12"}  rounded-3xl transition-all duration-500 w-full bg-none text-neutral-400 p-2 border-2 group-invalid:border-pink-500`}>
                {loaded ? (
                  <div className="relative h-full w-full flex flex-col gap-2">
                      { showVideo && url ? ( 
                        <div className="rounded-2xl overflow-clip">
                        <iframe className="object-cover w-[101%] -mt-3 aspect-video" src={embedTimeStampURL} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                      ) : (
                        <div className="bg-neutral-200 w-full h-full rounded-2xl aspect-video animate-pulse"/>
                      )}
                    
                    <button onClick={handleCloseClick} className="absolute group h-11 p-2 aspect-square -right-5 -top-5 rounded-full bg-neutral-200 border-8 border-white hover:bg-slate-400 hover:ring-slate-400 hover:ring-2 hover:border-[6px] transition-all" >
                      <CloseIcon className="w-full h-full fill-neutral-400 group-hover:fill-white"/>
                    </button>

                    { showVideo ? (
                    <div className={`${showDownload ? "hidden" : "visible"} flex my-auto justify-center px-4 text-md`}>
                      <div onTransitionEnd={() => setShowDownload(!!videoDownloaded)} className={`${video.data?.res ? "opacity-0" : "opacity-100"} flex w-full flex-row gap-2 items-center transition-all duration-500`}>
                        <label htmlFor="startTime" className="text-sm">Start</label>
                        <TimeInput onChangeTime={(time) => setStartTime(time)} fieldCount={3} className="w-24 border-2 p-2 rounded-full outline-neutral-400" />
                        <label htmlFor="endTime" className="text-sm">End</label>
                        <TimeInput onChangeTime={(time) => setEndTime(time)} fieldCount={3} className="w-24 border-2 p-2 rounded-full outline-neutral-400" />
                        <div className={`ml-auto flex flex-row gap-2 rounded-full border-2 border-neutral-400`}>
                          <button onClick={() => handleConfirmDownload(FileType.mp3)} 
                          className={`border-2 rounded-full text-sm px-3 py-1 text-white bg-slate-400 hover:bg-slate-500 transition-all`}>
                            MP3
                          </button>
                          <button onClick={() => handleConfirmDownload(FileType.mp4)} 
                          className={`border-2 rounded-full text-sm px-3 py-1 text-white bg-slate-400 hover:bg-slate-500 transition-all`}>
                            MP4
                          </button>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="w-full flex basis-1/6 rounded-full bg-neutral-200 animate-pulse"/>
                    )}
                  </div>
                ) : (
                  <input onChange={handleURLInputChange} type="url" placeholder="Enter YouTube video URL..." className="bg-none w-full h-full outline-none text-xl lg:text-2xl text-center placeholder:text-slate-200 focus:text-slate-500"></input>
                )}
              </div>
              <button type="submit" className={`${showDownload && 'hidden'} ${loaded ? `h-0 invisible` : `h-14`} aspect-square p-1 fill-slate-400 hover:fill-slate-500 rounded-full hover:ring-4 ring-slate-400 transition-all duration-300`}>
                <DownloadIcon height={"100%"} width={"100%"} className="rounded-full" />
              </button>
              <button>
                <a href={`./api/download?filename=${filePath}&filetype=${fileType}`} download={filePath} 
                className={`${showDownload ? "w-36 visible opacity-100" : "h-0 invisible opacity-0"} h-14 bg-red-1000 text-white rounded-full py-2 px-8 transition-all duration-500`}>
                  DOWNLOAD
                </a>
              </button>
            </form>
            {/*
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
*/}
        </div>
      </main>
    </>
  );
};

export default Home;
