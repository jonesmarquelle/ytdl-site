import { type NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import CloseIcon from "../components/CloseIcon";
import DownloadIcon from "../components/DownloadIcon";
import SpinnerIcon from "../components/SpinnerIcon";
import TimeInput from "../components/TimeInput";
import { trpc } from "../utils/trpc";

export enum FileType {
  mp3 = "mp3",
  mp4 = "mp4",
}

const Home: NextPage = () => {
  const utils = trpc.useContext();

  const [loaded, setLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const [url, setUrl] = useState<string>();
  const [validURL, setValidURL] = useState<boolean>(true);

  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [embedTimeStampURL, setEmbedTimeStampURL] = useState<string>();

  const [video, setVideo] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [videoDownloaded, setVideoDownloaded] = useState<boolean>();

  const [fileType, setFileType] = useState<FileType | undefined>();

  const timeInSecs = (timeString?: string) => {
    if (!timeString) return "null";
    const timeArr = timeString.split(':')
    if (timeArr.reduce((prev, curr) => { return (prev || !curr) }, false)) return undefined
    return timeArr.reduce((prev, curr) => { return prev * 60 + Number.parseInt(curr) }, 0)
  }

  useEffect(() => {
    if (!url) return;
    const embedUrl = (url: string) => `${url.replace("watch?v=", "embed/")}`;
    const timestampUrl = (url: string) => `${url}?start=${timeInSecs(startTime) ?? 0}&end=${timeInSecs(endTime) ?? 0}`;
    setEmbedTimeStampURL(timestampUrl(embedUrl(url)))
  }, [startTime, endTime, url])

  useEffect(() => {
    if (video) {
      setVideoDownloaded(true);
    } else {
      setVideoDownloaded(false);
    }
  }, [fileType, video]);

  const handleCloseClick = () => {
    setValidURL(true);
    setUrl(undefined);
    setLoaded(false);
    setVideoDownloaded(false);
    setShowDownload(false);
    setShowVideo(false);
    setVideo(null);
    setVideoLoading(false);
    setFileType(undefined);
    setEmbedTimeStampURL(undefined);
  }

  const handleSubmitURL = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) {
      setValidURL(false);
      return;
    }
    setValidURL(true);
    setLoaded(true);
  }

  const handleURLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value.replace('youtu.be/', 'www.youtube.com/watch?v='));
  }

  const handleConfirmDownload = async (type: FileType) => {
    if (!url) return;
    setVideoLoading(true);
    setFileType(type);
    const video = await utils.client.video.getVideo.query({ url, fileType: type, startTime, endTime });
    setVideo(video.res);
  }

  const downloadFile = () => {
    if (!video || !fileType) return;
    const getPath = video;
    const getType = fileType;
    handleCloseClick()

    fetch(`./api/download?filename=${getPath}&filetype=${getType}`)
      .then((res) => res.blob())
      .then((blob) => {
        const localURL = URL.createObjectURL(blob);
        handleCloseClick();
        const anchor = document.createElement('a');
        anchor.setAttribute('href', localURL);
        anchor.setAttribute('download', getPath);
        anchor.click();
      });
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
            <div onTransitionEnd={() => setShowVideo(true)} className={`${!validURL && 'border-pink-500'} ${loaded ? (showDownload ? "aspect-video" : "h-[58vh] sm:h-[56vh] md:h-[60vh]") : "h-12"} relative rounded-3xl transition-all duration-500 w-full bg-transparent text-neutral-400 p-2 border-2 group-invalid:border-pink-500`}>
              {loaded ? (
                <div className="w-[95%] sm:w-full flex flex-col gap-2">
                  {showVideo && url ? (
                      <iframe className=" rounded-2xl border-2 aspect-video" src={embedTimeStampURL} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : (
                    <div className="bg-neutral-200 w-full h-full rounded-2xl aspect-video animate-pulse" />
                  )}

                  <button onClick={handleCloseClick} className="absolute group h-8 p-2 hover:p-1 aspect-square -right-2 -top-2 rounded-full bg-white border-2 hover:bg-slate-400 hover:ring-slate-400 hover:ring-2 hover:border-[6px] transition-all">
                    <CloseIcon className="w-full h-full fill-neutral-400 group-hover:fill-white" />
                  </button>

                  {showVideo ? (
                    <div className={`${showDownload ? "-my-2 h-0" : ""} flex justify-center px-4 text-md transition-all duration-300`}>
                      <div onTransitionEnd={() => setShowDownload(!!videoDownloaded)} className={`${video ? "translate-x-6 opacity-0" : "opacity-100"} flex w-full flex-col sm:flex-row gap-2 items-center transition-all duration-500`}>
                        <div className={`flex flex-row gap-2`}>
                          <div className="flex flex-col sm:flex-row gap-1 items-center">
                            <label htmlFor="startTime" className="text-sm">Start</label>
                            <TimeInput onChangeTime={(time) => setStartTime(time)} fieldCount={3} className="w-24 border-2 sm:p-2 rounded-full outline-neutral-400" />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1 items-center">
                            <label htmlFor="endTime" className="text-sm">End</label>
                            <TimeInput onChangeTime={(time) => setEndTime(time)} fieldCount={3} className="w-24 border-2 sm:p-2 rounded-full outline-neutral-400" />
                          </div>
                        </div>
                        <div className={`${videoLoading ? 'border-0 w-10' : 'border-2 w-[12.5rem]'} sm:ml-auto flex rounded-full border-neutral-400 items-center transition-all duration-300`}>
                          {videoLoading ? (
                            <SpinnerIcon strokeWidth={8} className="m-auto h-10 w-10 animate-spin" />
                          ) : (
                            <div className="flex flex-row gap-1 h-10 w-[12.5rem]">
                              <button
                                onClick={() => handleConfirmDownload(FileType.mp3)}
                                className={`border-2 w-full rounded-full text-sm px-3 py-1 text-white bg-slate-400 hover:bg-slate-500 transition-all`}>
                                MP3
                              </button>
                              <button
                                onClick={() => handleConfirmDownload(FileType.mp4)}
                                className={`border-2 w-full rounded-full text-sm px-3 py-1 text-white bg-slate-400 hover:bg-slate-500 transition-all`}>
                                MP4
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex basis-1/6 rounded-full bg-neutral-200 animate-pulse" />
                  )}
                </div>
              ) : (
                <input onChange={handleURLInputChange} type="url" placeholder="Enter YouTube video URL..." className="bg-transparent w-full h-full outline-none text-xl lg:text-2xl text-center placeholder:text-slate-200 focus:text-slate-500" />
              )}
            </div>
            <button type="submit" className={`${showDownload && 'hidden'} ${loaded ? `h-0 invisible` : `h-14`} aspect-square p-1 fill-slate-400 hover:fill-slate-500 rounded-full hover:ring-4 ring-slate-400 transition-all duration-300`}>
              <DownloadIcon height={"100%"} width={"100%"} className="rounded-full" />
            </button>
            <button
              onClick={downloadFile}
              className={`${showDownload ? 'opacity-100 visible' : 'opacity-0 invisible'} h-14 bg-slate-400 hover:bg-slate-500 hover:rounded-md text-white text-l tracking-widest hover:text-2xl rounded-3xl py-2 px-8 transition-all duration-300`}>
              DOWNLOAD
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Home;
