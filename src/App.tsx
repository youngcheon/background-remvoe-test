import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useEffect, useState } from 'react'
import ViewerCard from './core/components/ViewerCard'
import { BackgroundConfig } from './core/helpers/backgroundHelper'
import { PostProcessingConfig } from './core/helpers/postProcessingHelper'
import { SegmentationConfig } from './core/helpers/segmentationHelper'
import { SourceConfig, sourceImageUrls } from './core/helpers/sourceHelper'
import useBodyPix from './core/hooks/useBodyPix'
import useTFLite from './core/hooks/useTFLite'
import html2canvas from 'html2canvas'

function App() {
  const classes = useStyles()
  const [sourceConfig, setSourceConfig] = useState<SourceConfig>({
    type: 'camera',
    url: sourceImageUrls[0],
  })
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: 'image',
    url: undefined,
  })
  const [segmentationConfig, setSegmentationConfig] =
    useState<SegmentationConfig>({
      model: 'mlkit',
      backend: 'wasm',
      inputResolution: '256x256',
      pipeline: 'canvas2dCpu',
    })
  const [postProcessingConfig, setPostProcessingConfig] =
    useState<PostProcessingConfig>({
      smoothSegmentationMask: true,
      jointBilateralFilter: { sigmaSpace: 1, sigmaColor: 0.1 },
      coverage: [0.5, 0.75],
      lightWrapping: 0.5,
      blendMode: 'screen',
    })
  const bodyPix = useBodyPix()
  const { tflite, isSIMDSupported } = useTFLite(segmentationConfig)

  useEffect(() => {
    setSegmentationConfig((previousSegmentationConfig) => {
      if (previousSegmentationConfig.backend === 'wasm' && isSIMDSupported) {
        return { ...previousSegmentationConfig, backend: 'wasmSimd' }
      } else {
        return previousSegmentationConfig
      }
    })
  }, [isSIMDSupported])
  let url: string = ''
  const onCapture = () => {
    let temp = document.getElementById('capture')
    if (temp) {
      html2canvas(temp).then((canvas) => {
        let myimg = canvas.toDataURL('image/png')
        OnSaveAs(myimg, 'image-download.png')
      })
    }
  }
  const OnSaveAs = (uri: string, filename: string) => {
    var link = document.createElement('a')
    document.body.appendChild(link)
    link.href = uri
    link.download = filename
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div>
        <div className={classes.image} id="cap">
          <ViewerCard
            sourceConfig={sourceConfig}
            backgroundConfig={backgroundConfig}
            segmentationConfig={segmentationConfig}
            postProcessingConfig={postProcessingConfig}
            bodyPix={bodyPix}
            tflite={tflite}
          />
        </div>
      </div>
      <button onClick={onCapture}>저장</button>
    </>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      float: 'left',
      position: 'relative',
      margin: 0,
    },
    root: {
      // display: 'grid',
      // [theme.breakpoints.up('xs')]: {
      //   margin: theme.spacing(1),
      //   gap: theme.spacing(1),
      //   gridTemplateColumns: '1fr',
      // },
      // [theme.breakpoints.up('md')]: {
      //   margin: theme.spacing(2),
      //   gap: theme.spacing(2),
      //   gridTemplateColumns: 'repeat(2, 1fr)',
      // },
      // [theme.breakpoints.up('lg')]: {
      //   gridTemplateColumns: 'repeat(3, 1fr)',
      // },
      // },
      // resourceSelectionCards: {
      //   display: 'flex',
      //   flexDirection: 'column',
    },
  })
)

export default App
