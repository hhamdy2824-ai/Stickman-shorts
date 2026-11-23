import React from "react";
import {Composition, Folder} from "remotion";
import {VIDEO} from "./style/theme";
import {CharacterSheet, PoseSheet, PropSheet} from "./videos/Sheets";
import {TEST_MONTAGE_LEN, TEST_SPLIT_LEN, TestMontage, TestRows, TestSplit} from "./videos/Tests";
import {SpecVideo, VideoSpec, specLength} from "./spec/SpecVideo";
import sample from "../specs/sample.json";

// Register every video here. id = output file name.
export const RemotionRoot: React.FC = () => {
  const common = {fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height};
  return (
    <>
      <Folder name="Library">
        <Composition id="PropSheet" component={PropSheet} durationInFrames={1} {...common} />
        <Composition id="PoseSheet" component={PoseSheet} durationInFrames={1} {...common} />
        <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} {...common} />
      </Folder>
      <Folder name="EngineTests">
        <Composition id="Test-Split" component={TestSplit} durationInFrames={TEST_SPLIT_LEN} {...common} />
        <Composition id="Test-Rows" component={TestRows} durationInFrames={260} {...common} />
        <Composition id="Test-Montage" component={TestMontage} durationInFrames={TEST_MONTAGE_LEN} {...common} />
      </Folder>
      {/* Every real video: npx remotion render Spec out/<id>.mp4 --props=specs/<id>.json */}
      <Composition
        id="Spec"
        component={SpecVideo as unknown as React.FC<Record<string, unknown>>}
        defaultProps={sample as unknown as Record<string, unknown>}
        calculateMetadata={({props}) => ({durationInFrames: specLength(props as unknown as VideoSpec)})}
        {...common}
        durationInFrames={1830}
      />
    </>
  );
};
