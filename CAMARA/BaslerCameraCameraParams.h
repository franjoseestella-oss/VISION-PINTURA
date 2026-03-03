//-----------------------------------------------------------------------------
//  Basler pylon SDK
//  Copyright (c) 2023-2025 Basler AG
//  http://www.baslerweb.com
//-----------------------------------------------------------------------------

/*!
\file
\brief A parameter class containing all parameters as members that are available for acA1920-48gm

Sources:
acA1920-48gm 107263-04;U;acA1920_48g;V1.1-0;0
*/

//-----------------------------------------------------------------------------
//  This file is generated automatically
//  Do not modify!
//-----------------------------------------------------------------------------

#ifndef BASLER_PYLON_BASLERCAMERACAMERAPARAMS_H
#define BASLER_PYLON_BASLERCAMERACAMERAPARAMS_H

#pragma once

// common parameter types
#include <pylon/ParameterIncludes.h>
#include <pylon/EnumParameterT.h>

#ifdef _MSC_VER
#pragma warning( push )
#pragma warning( disable : 4250 ) // warning C4250: 'Pylon::CXYZParameter': inherits 'Pylon::CParameter::Pylon::CParameter::ZYX' via dominance
#endif

//! The namespace containing the a control interface and related enumeration types for acA1920-48gm
namespace Pylon
{
namespace BaslerCameraCameraParams_Params
{
    //**************************************************************************************************
    // Enumerations
    //**************************************************************************************************
    //! Valid values for AcquisitionMode
    enum AcquisitionModeEnums
    {
        AcquisitionMode_Continuous,  //!< The acquisition mode is set to continuous - Applies to: acA1920-48gm
        AcquisitionMode_SingleFrame  //!< The acquisition mode is set to single frame - Applies to: acA1920-48gm
    };

    //! Valid values for AcquisitionStatusSelector
    enum AcquisitionStatusSelectorEnums
    {
        AcquisitionStatusSelector_AcquisitionActive,  //!< A check can be performed if the device is currently acquiring one or multiple frames - Applies to: acA1920-48gm
        AcquisitionStatusSelector_AcquisitionTransfer,  //!< A check can be performed if the device is currently transferring an acquisition of one or multiple frames - Applies to: acA1920-48gm
        AcquisitionStatusSelector_AcquisitionTriggerWait,  //!< A check can be performed if the device is currently waiting for a trigger to acquire one or multiple frames - Applies to: acA1920-48gm
        AcquisitionStatusSelector_ExposureActive,  //!< A check can be performed if the device is currently exposing a frame - Applies to: acA1920-48gm
        AcquisitionStatusSelector_FrameActive,  //!< A check can be performed if the device is currently capturing a frame - Applies to: acA1920-48gm
        AcquisitionStatusSelector_FrameTransfer,  //!< A check can be performed if the device is currently transferring a frame - Applies to: acA1920-48gm
        AcquisitionStatusSelector_FrameTriggerWait,  //!< A check can be performed if the device is currently waiting for a frame trigger - Applies to: acA1920-48gm
        AcquisitionStatusSelector_LineTriggerWait  //!< A check can be performed if the device is currently waiting for a line trigger - Applies to: acA1920-48gm
    };

    //! Valid values for AutoFunctionAOISelector
    enum AutoFunctionAOISelectorEnums
    {
        AutoFunctionAOISelector_AOI1,  //!< Auto function AOI 1 can be adjusted - Applies to: acA1920-48gm
        AutoFunctionAOISelector_AOI2  //!< Auto function AOI 2 can be adjusted - Applies to: acA1920-48gm
    };

    //! Valid values for AutoFunctionProfile
    enum AutoFunctionProfileEnums
    {
        AutoFunctionProfile_ExposureMinimum,  //!< Exposure time is kept as low as possible - Applies to: acA1920-48gm
        AutoFunctionProfile_GainMinimum  //!< Gain is kept as low as possible - Applies to: acA1920-48gm
    };

    //! Valid values for BalanceRatioSelector
    enum BalanceRatioSelectorEnums
    {
        BalanceRatioSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for BalanceWhiteAuto
    enum BalanceWhiteAutoEnums
    {
        BalanceWhiteAuto_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for BinningHorizontalMode
    enum BinningHorizontalModeEnums
    {
        BinningHorizontalMode_Average,  //!< The values of the binned pixels are averaged - Applies to: acA1920-48gm
        BinningHorizontalMode_Sum  //!< The values of the binned pixels are summed - Applies to: acA1920-48gm
    };

    //! Valid values for BinningVerticalMode
    enum BinningVerticalModeEnums
    {
        BinningVerticalMode_Average,  //!< The values of the binned pixels are averaged - Applies to: acA1920-48gm
        BinningVerticalMode_Sum  //!< The values of the binned pixels are summed - Applies to: acA1920-48gm
    };

    //! Valid values for BlackLevelSelector
    enum BlackLevelSelectorEnums
    {
        BlackLevelSelector_All  //!< Black level is applied to all channels or taps - Applies to: acA1920-48gm
    };

    //! Valid values for ChunkSelector
    enum ChunkSelectorEnums
    {
        ChunkSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for ColorAdjustmentSelector
    enum ColorAdjustmentSelectorEnums
    {
        ColorAdjustmentSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for ColorTransformationSelector
    enum ColorTransformationSelectorEnums
    {
        ColorTransformationSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for ColorTransformationValueSelector
    enum ColorTransformationValueSelectorEnums
    {
        ColorTransformationValueSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for CounterEventSource
    enum CounterEventSourceEnums
    {
        CounterEventSource_FrameTrigger  //!< The selected counter counts the number of frame trigger events - Applies to: acA1920-48gm
    };

    //! Valid values for CounterResetSource
    enum CounterResetSourceEnums
    {
        CounterResetSource_Line1,  //!< The selected counter can be reset by a signal applied to Line 1 - Applies to: acA1920-48gm
        CounterResetSource_Line3,  //!< The selected counter can be reset by a signal applied to Line 3 - Applies to: acA1920-48gm
        CounterResetSource_Off,  //!< The counter reset is disabled - Applies to: acA1920-48gm
        CounterResetSource_Software  //!< The selected counter can be reset by a software command - Applies to: acA1920-48gm
    };

    //! Valid values for CounterSelector
    enum CounterSelectorEnums
    {
        CounterSelector_Counter1,  //!< Counter 1 can be configured - Applies to: acA1920-48gm
        CounterSelector_Counter2  //!< Counter 2 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for DemosaicingMode
    enum DemosaicingModeEnums
    {
        DemosaicingMode_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for DeviceScanType
    enum DeviceScanTypeEnums
    {
        DeviceScanType_Areascan,  //!< The device has an area scan sensor - Applies to: acA1920-48gm
        DeviceScanType_Linescan  //!< The device has a line scan sensor - Applies to: acA1920-48gm
    };

    //! Valid values for EventNotification
    enum EventNotificationEnums
    {
        EventNotification_GenICamEvent,  //!< Event notifications are enabled and the notification type is set to GenICam - Applies to: acA1920-48gm
        EventNotification_Off,  //!< Event notifications are disabled - Applies to: acA1920-48gm
        EventNotification_On  //!< Event notifications are enabled - Applies to: acA1920-48gm
    };

    //! Valid values for EventSelector
    enum EventSelectorEnums
    {
        EventSelector_AcquisitionStart,  //!< Event notifications for the acquisition start event can be enabled - Applies to: acA1920-48gm
        EventSelector_AcquisitionStartOvertrigger,  //!< Event notifications for the acquisition start overtrigger event can be enabled - Applies to: acA1920-48gm
        EventSelector_AcquisitionStartWait,  //!< Event notifications for the acquisition start wait event can be enabled - Applies to: acA1920-48gm
        EventSelector_ActionLate,  //!< Event notifications for the action late event can be enabled - Applies to: acA1920-48gm
        EventSelector_CriticalTemperature,  //!< Event notifications for the critical temperature event can be enabled - Applies to: acA1920-48gm
        EventSelector_EventOverrun,  //!< Event notifications for the event overrun event can be enabled - Applies to: acA1920-48gm
        EventSelector_ExposureEnd,  //!< Event notifications for the exposure end event can be enabled - Applies to: acA1920-48gm
        EventSelector_FrameStart,  //!< Event notifications for the frame start event can be enabled - Applies to: acA1920-48gm
        EventSelector_FrameStartOvertrigger,  //!< Event notifications for the frame start overtrigger event can be enabled - Applies to: acA1920-48gm
        EventSelector_FrameStartWait,  //!< Event notifications for the frame start wait event can be enabled - Applies to: acA1920-48gm
        EventSelector_OverTemperature  //!< Event notifications for the over temperature event can be enabled - Applies to: acA1920-48gm
    };

    //! Valid values for ExpertFeatureAccessSelector
    enum ExpertFeatureAccessSelectorEnums
    {
        ExpertFeatureAccessSelector_ExpertFeature1,  //!< Expert Feature 1 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature1_Legacy,  //!< Expert Feature 1 (legacy) can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature2,  //!< Expert Feature 2 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature3,  //!< Expert Feature 3 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature4,  //!< Expert Feature 4 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature5,  //!< Expert Feature 5 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature6,  //!< Expert Feature 6 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature7,  //!< Expert Feature 7 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature8,  //!< Expert feature 8 can be configured - Applies to: acA1920-48gm
        ExpertFeatureAccessSelector_ExpertFeature9  //!< Expert feature 9 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for ExposureAuto
    enum ExposureAutoEnums
    {
        ExposureAuto_Continuous,  //!< Exposure time is adjusted repeatedly while images are acquired - Applies to: acA1920-48gm
        ExposureAuto_Off,  //!< The exposure time auto function is disabled - Applies to: acA1920-48gm
        ExposureAuto_Once  //!< Exposure time is adjusted automatically until it reaches a specific target value - Applies to: acA1920-48gm
    };

    //! Valid values for ExposureMode
    enum ExposureModeEnums
    {
        ExposureMode_Timed  //!< The timed exposure mode is set - Applies to: acA1920-48gm
    };

    //! Valid values for ExposureOverlapTimeMode
    enum ExposureOverlapTimeModeEnums
    {
        ExposureOverlapTimeMode_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for FileOpenMode
    enum FileOpenModeEnums
    {
        FileOpenMode_Read,  //!< Files are opened in read-only mode - Applies to: acA1920-48gm
        FileOpenMode_Write  //!< Files are opened in write-only mode - Applies to: acA1920-48gm
    };

    //! Valid values for FileOperationSelector
    enum FileOperationSelectorEnums
    {
        FileOperationSelector_Close,  //!< The currently selected file can be closed - Applies to: acA1920-48gm
        FileOperationSelector_Open,  //!< The currently selected file can be opened - Applies to: acA1920-48gm
        FileOperationSelector_Read,  //!< The currently selected file can be read - Applies to: acA1920-48gm
        FileOperationSelector_Write  //!< The currently selected file can be written - Applies to: acA1920-48gm
    };

    //! Valid values for FileOperationStatus
    enum FileOperationStatusEnums
    {
        FileOperationStatus_Failure,  //!< The file operation has failed - Applies to: acA1920-48gm
        FileOperationStatus_Success  //!< The file operation was successful - Applies to: acA1920-48gm
    };

    //! Valid values for FileSelector
    enum FileSelectorEnums
    {
        FileSelector_ExpertFeature7File,  //!< The 'Expert Feature 7 File' file is set - Applies to: acA1920-48gm
        FileSelector_UserData,  //!< The 'User Data' file is set - Applies to: acA1920-48gm
        FileSelector_UserGainShading1,  //!< The 'User Gain Shading 1' file is set - Applies to: acA1920-48gm
        FileSelector_UserGainShading2,  //!< The 'User Gain Shading 2' file is set - Applies to: acA1920-48gm
        FileSelector_UserOffsetShading1,  //!< The 'User Offset Shading 1' file is set - Applies to: acA1920-48gm
        FileSelector_UserOffsetShading2,  //!< The 'User Offset Shading 2' file is set - Applies to: acA1920-48gm
        FileSelector_UserSet1,  //!< The 'User Set 1' file is set - Applies to: acA1920-48gm
        FileSelector_UserSet2,  //!< The 'User Set 2' file is set - Applies to: acA1920-48gm
        FileSelector_UserSet3  //!< The 'User Set 3' file is set - Applies to: acA1920-48gm
    };

    //! Valid values for GainAuto
    enum GainAutoEnums
    {
        GainAuto_Continuous,  //!< Gain is adjusted repeatedly while images are acquired - Applies to: acA1920-48gm
        GainAuto_Off,  //!< The gain auto function is disabled - Applies to: acA1920-48gm
        GainAuto_Once  //!< Gain is adjusted automatically until it reaches a specific target value - Applies to: acA1920-48gm
    };

    //! Valid values for GainSelector
    enum GainSelectorEnums
    {
        GainSelector_All  //!< Gain is applied to all channels or taps - Applies to: acA1920-48gm
    };

    //! Valid values for GammaSelector
    enum GammaSelectorEnums
    {
        GammaSelector_User,  //!< The gamma curve can be configured by the user - Applies to: acA1920-48gm
        GammaSelector_sRGB  //!< The gamma curve is set to a fixed sRGB curve - Applies to: acA1920-48gm
    };

    //! Valid values for GevCCP
    enum GevCCPEnums
    {
        GevCCP_Control,  //!< The control channel privilege feature is set to control - Applies to: acA1920-48gm
        GevCCP_Exclusive,  //!< The control channel privilege feature is set to exclusive - Applies to: acA1920-48gm
        GevCCP_ExclusiveControl  //!< The control channel privilege feature is set to exclusive control - Applies to: acA1920-48gm
    };

    //! Valid values for GevIEEE1588Status
    enum GevIEEE1588StatusEnums
    {
        GevIEEE1588Status_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for GevIEEE1588StatusLatched
    enum GevIEEE1588StatusLatchedEnums
    {
        GevIEEE1588StatusLatched_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for GevInterfaceSelector
    enum GevInterfaceSelectorEnums
    {
        GevInterfaceSelector_NetworkInterface0  //!< Network interface 0 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for GevStreamChannelSelector
    enum GevStreamChannelSelectorEnums
    {
        GevStreamChannelSelector_StreamChannel0  //!< Stream channel 0 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for LUTSelector
    enum LUTSelectorEnums
    {
        LUTSelector_Luminance  //!< The luminance lookup table can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for LastError
    enum LastErrorEnums
    {
        LastError_InsufficientTriggerWidth,  //!< The trigger width was too short - Applies to: acA1920-48gm
        LastError_InvalidParameter,  //!< A parameter was set to an invalid value - Applies to: acA1920-48gm
        LastError_NoError,  //!< No error was detected - Applies to: acA1920-48gm
        LastError_OverTemperature,  //!< An over temperature state has been detected - Applies to: acA1920-48gm
        LastError_Overtrigger,  //!< The camera was overtriggered - Applies to: acA1920-48gm
        LastError_PowerFailure,  //!< The power supply is not sufficient - Applies to: acA1920-48gm
        LastError_UserDefPixFailure,  //!< A user defect pixel failure occurred - Applies to: acA1920-48gm
        LastError_Userset  //!< An error was detected while loading a userset - Applies to: acA1920-48gm
    };

    //! Valid values for LightSourceSelector
    enum LightSourceSelectorEnums
    {
        LightSourceSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for LineFormat
    enum LineFormatEnums
    {
        LineFormat_LVDS,  //!< The line is currently accepting or sending LVDS level signals - Applies to: acA1920-48gm
        LineFormat_NoConnect,  //!< The line is not connected - Applies to: acA1920-48gm
        LineFormat_OptoCoupled,  //!< The line is opto-coupled - Applies to: acA1920-48gm
        LineFormat_RS422,  //!< The line is currently accepting or sending RS-422 level signals - Applies to: acA1920-48gm
        LineFormat_TTL,  //!< The line is currently accepting or sending TTL level signals - Applies to: acA1920-48gm
        LineFormat_TriState  //!< The line is currently in tri-state mode (not driven) - Applies to: acA1920-48gm
    };

    //! Valid values for LineLogic
    enum LineLogicEnums
    {
        LineLogic_Negative,  //!< The line logic of the currently selected line is negative - Applies to: acA1920-48gm
        LineLogic_Positive  //!< The line logic of the currently selected line is positive - Applies to: acA1920-48gm
    };

    //! Valid values for LineMode
    enum LineModeEnums
    {
        LineMode_Input,  //!< The selected physical line can be used to input an electrical signal - Applies to: acA1920-48gm
        LineMode_Output  //!< The selected physical line can be used to output an electrical signal - Applies to: acA1920-48gm
    };

    //! Valid values for LineSelector
    enum LineSelectorEnums
    {
        LineSelector_Line1,  //!< Line 1 can be configured - Applies to: acA1920-48gm
        LineSelector_Line2,  //!< Line 2 can be configured - Applies to: acA1920-48gm
        LineSelector_Line3  //!< Line 3 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for LineSource
    enum LineSourceEnums
    {
        LineSource_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for ParameterSelector
    enum ParameterSelectorEnums
    {
        ParameterSelector_AutoTargetValue,  //!< The factory limits of the AutoTargetValue parameter can be removed - Applies to: acA1920-48gm
        ParameterSelector_ExposureTime,  //!< The factory limits of the ExposureTime parameter can be removed - Applies to: acA1920-48gm
        ParameterSelector_Gain  //!< The factory limits of the Gain parameter can be removed - Applies to: acA1920-48gm
    };

    //! Valid values for PixelColorFilter
    enum PixelColorFilterEnums
    {
        PixelColorFilter_Bayer_BG,  //!< The Bayer filter has a BG/GR alignment to the pixels in the acquired images - Applies to: acA1920-48gm
        PixelColorFilter_Bayer_GB,  //!< The Bayer filter has a GB/RG alignment to the pixels in the acquired images - Applies to: acA1920-48gm
        PixelColorFilter_Bayer_GR,  //!< The Bayer filter has a GR/BG alignment to the pixels in the acquired images - Applies to: acA1920-48gm
        PixelColorFilter_Bayer_RG,  //!< The Bayer filter has an RG/GB alignment to the pixels in the acquired images - Applies to: acA1920-48gm
        PixelColorFilter_None  //!< No Bayer filter is present on the camera - Applies to: acA1920-48gm
    };

    //! Valid values for PixelFormat
    enum PixelFormatEnums
    {
        PixelFormat_Mono10,  //!< The pixel format is set to Mono 10 - Applies to: acA1920-48gm
        PixelFormat_Mono10p,  //!< The pixel format is set to Mono 10p - Applies to: acA1920-48gm
        PixelFormat_Mono8  //!< The pixel format is set to Mono 8 - Applies to: acA1920-48gm
    };

    //! Valid values for PixelSize
    enum PixelSizeEnums
    {
        PixelSize_Bpp1,  //!< The depth of the pixel values in the acquired images is 1 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp10,  //!< The depth of the pixel values in the acquired images is 10 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp12,  //!< The depth of the pixel values in the acquired images is 12 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp16,  //!< The depth of the pixel values in the acquired images is 16 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp2,  //!< The depth of the pixel values in the acquired images is 2 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp24,  //!< The depth of the pixel values in the acquired images is 24 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp32,  //!< The depth of the pixel values in the acquired images is 32 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp36,  //!< The depth of the pixel values in the acquired images is 36 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp4,  //!< The depth of the pixel values in the acquired images is 4 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp48,  //!< The depth of the pixel values in the acquired images is 48 bits per pixel - Applies to: acA1920-48gm
        PixelSize_Bpp8  //!< The depth of the pixel values in the acquired images is 8 bits per pixel - Applies to: acA1920-48gm
    };

    //! Valid values for SensorReadoutMode
    enum SensorReadoutModeEnums
    {
        SensorReadoutMode_Fast,  //!< The device operates in fast readout mode - Applies to: acA1920-48gm
        SensorReadoutMode_Normal  //!< The device operates in normal readout mode - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceAddressBitSelector
    enum SequenceAddressBitSelectorEnums
    {
        SequenceAddressBitSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceAddressBitSource
    enum SequenceAddressBitSourceEnums
    {
        SequenceAddressBitSource_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceAdvanceMode
    enum SequenceAdvanceModeEnums
    {
        SequenceAdvanceMode_Auto,  //!< The automatic sequence set advance mode is set - Applies to: acA1920-48gm
        SequenceAdvanceMode_Controlled,  //!< The controlled sequence set advance mode is set - Applies to: acA1920-48gm
        SequenceAdvanceMode_FreeSelection  //!< The free selection sequence set advance mode is set - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceConfigurationMode
    enum SequenceConfigurationModeEnums
    {
        SequenceConfigurationMode_Off,  //!< The sequencer can not be configured - Applies to: acA1920-48gm
        SequenceConfigurationMode_On  //!< The sequencer can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceControlSelector
    enum SequenceControlSelectorEnums
    {
        SequenceControlSelector_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for SequenceControlSource
    enum SequenceControlSourceEnums
    {
        SequenceControlSource_Todo  //!< TODO - Applies to: acA1920-48gm
    };

    //! Valid values for ShutterMode
    enum ShutterModeEnums
    {
        ShutterMode_Global  //!< The shutter mode is set to global shutter - Applies to: acA1920-48gm
    };

    //! Valid values for SyncUserOutputSelector
    enum SyncUserOutputSelectorEnums
    {
        SyncUserOutputSelector_SyncUserOutput1,  //!< User settable synchronous output signal 1 can be configured - Applies to: acA1920-48gm
        SyncUserOutputSelector_SyncUserOutput2  //!< User settable synchronous output signal 2 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for TemperatureSelector
    enum TemperatureSelectorEnums
    {
        TemperatureSelector_Coreboard  //!< The temperature is measured on the core board - Applies to: acA1920-48gm
    };

    //! Valid values for TemperatureState
    enum TemperatureStateEnums
    {
        TemperatureState_Critical,  //!< Temperature is critical - Applies to: acA1920-48gm
        TemperatureState_Error,  //!< Temperature state could not be retrieved - Applies to: acA1920-48gm
        TemperatureState_Ok  //!< Temperature is normal - Applies to: acA1920-48gm
    };

    //! Valid values for TestImageSelector
    enum TestImageSelectorEnums
    {
        TestImageSelector_Off,  //!< The camera does not display a test image - Applies to: acA1920-48gm
        TestImageSelector_Testimage1,  //!< The camera generates and displays a test image with a test image 1 pattern - Applies to: acA1920-48gm
        TestImageSelector_Testimage2,  //!< The camera generates and displays a test image with a test image 2 pattern - Applies to: acA1920-48gm
        TestImageSelector_Testimage3,  //!< The camera generates and displays a test image with a test image 3 pattern - Applies to: acA1920-48gm
        TestImageSelector_Testimage4,  //!< The camera generates and displays a test image with a test image 4 pattern - Applies to: acA1920-48gm
        TestImageSelector_Testimage5  //!< The camera generates and displays a test image with a test image 5 pattern - Applies to: acA1920-48gm
    };

    //! Valid values for TimerSelector
    enum TimerSelectorEnums
    {
        TimerSelector_Timer1  //!< Timer 1 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for TimerTriggerActivation
    enum TimerTriggerActivationEnums
    {
        TimerTriggerActivation_RisingEdge  //!< The timer will be started by a rising edge signal change - Applies to: acA1920-48gm
    };

    //! Valid values for TimerTriggerSource
    enum TimerTriggerSourceEnums
    {
        TimerTriggerSource_ExposureStart  //!< The timer can be triggered by the exposure start signal - Applies to: acA1920-48gm
    };

    //! Valid values for TriggerActivation
    enum TriggerActivationEnums
    {
        TriggerActivation_FallingEdge,  //!< The selected trigger is activated on the falling edge of the source signal - Applies to: acA1920-48gm
        TriggerActivation_RisingEdge  //!< The selected trigger is activated on the rising edge of the source signal - Applies to: acA1920-48gm
    };

    //! Valid values for TriggerMode
    enum TriggerModeEnums
    {
        TriggerMode_Off,  //!< The currently selected trigger is turned off - Applies to: acA1920-48gm
        TriggerMode_On  //!< The currently selected trigger is turned on - Applies to: acA1920-48gm
    };

    //! Valid values for TriggerSelector
    enum TriggerSelectorEnums
    {
        TriggerSelector_AcquisitionStart,  //!< The acquisition start trigger can be configured - Applies to: acA1920-48gm
        TriggerSelector_FrameStart  //!< The frame start trigger can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for TriggerSource
    enum TriggerSourceEnums
    {
        TriggerSource_Action1,  //!< The signal source for the selected trigger is set to action command signal 1 - Applies to: acA1920-48gm
        TriggerSource_Line1,  //!< The signal source for the selected trigger is set to line 1 - Applies to: acA1920-48gm
        TriggerSource_Line3,  //!< The signal source for the selected trigger is set to line 3 - Applies to: acA1920-48gm
        TriggerSource_Software  //!< The signal source for the selected trigger is set to software triggering - Applies to: acA1920-48gm
    };

    //! Valid values for UserDefinedValueSelector
    enum UserDefinedValueSelectorEnums
    {
        UserDefinedValueSelector_Value1,  //!< The user-defined value 1 can be set or read - Applies to: acA1920-48gm
        UserDefinedValueSelector_Value2,  //!< The user-defined value 2 can be set or read - Applies to: acA1920-48gm
        UserDefinedValueSelector_Value3,  //!< The user-defined value 3 can be set or read - Applies to: acA1920-48gm
        UserDefinedValueSelector_Value4,  //!< The user-defined value 4 can be set or read - Applies to: acA1920-48gm
        UserDefinedValueSelector_Value5  //!< The user-defined value 5 can be set or read - Applies to: acA1920-48gm
    };

    //! Valid values for UserOutputSelector
    enum UserOutputSelectorEnums
    {
        UserOutputSelector_UserOutput1,  //!< The user settable output signal 1 can be configured - Applies to: acA1920-48gm
        UserOutputSelector_UserOutput2  //!< The user settable output signal 2 can be configured - Applies to: acA1920-48gm
    };

    //! Valid values for UserSetDefaultSelector
    enum UserSetDefaultSelectorEnums
    {
        UserSetDefaultSelector_AutoFunctions,  //!< The factory set enabling auto functions is set as the startup set - Applies to: acA1920-48gm
        UserSetDefaultSelector_Default,  //!< The default factory set is set as the as the startup set - Applies to: acA1920-48gm
        UserSetDefaultSelector_HighGain,  //!< The high gain factory set is set as the startup set - Applies to: acA1920-48gm
        UserSetDefaultSelector_UserSet1,  //!< User set 1 is set as the startup set - Applies to: acA1920-48gm
        UserSetDefaultSelector_UserSet2,  //!< User set 2 is set as the startup set - Applies to: acA1920-48gm
        UserSetDefaultSelector_UserSet3  //!< User set 3 is set as the startup set - Applies to: acA1920-48gm
    };

    //! Valid values for UserSetSelector
    enum UserSetSelectorEnums
    {
        UserSetSelector_AutoFunctions,  //!< The factory set enabling auto functions can be loaded - Applies to: acA1920-48gm
        UserSetSelector_Default,  //!< The default factory set can be loaded - Applies to: acA1920-48gm
        UserSetSelector_HighGain,  //!< The high gain factory set can be loaded - Applies to: acA1920-48gm
        UserSetSelector_UserSet1,  //!< User set 1 can be saved, loaded, or configured - Applies to: acA1920-48gm
        UserSetSelector_UserSet2,  //!< User set 2 can be saved, loaded, or configured - Applies to: acA1920-48gm
        UserSetSelector_UserSet3  //!< User set 3 can be saved, loaded, or configured - Applies to: acA1920-48gm
    };


    
    
    //**************************************************************************************************
    // Parameter class BaslerCameraCameraParams
    //**************************************************************************************************
    

    /*!
    \brief A parameter class containing all parameters as members that are available for acA1920-48gm

    Sources:
    acA1920-48gm 107263-04;U;acA1920_48g;V1.1-0;0
    */
    class BaslerCameraCameraParams
    {
    //----------------------------------------------------------------------------------------------------------------
    // Implementation
    //----------------------------------------------------------------------------------------------------------------
    protected:
        // If you want to show the following methods in the help file
        // add the string HIDE_CLASS_METHODS to the ENABLED_SECTIONS tag in the doxygen file
        //! \cond HIDE_CLASS_METHODS
        
            //! Constructor
            BaslerCameraCameraParams(void);

            //! Destructor
            ~BaslerCameraCameraParams(void);

            //! Initializes the references
            void _Initialize(GENAPI_NAMESPACE::INodeMap*);

    //! \endcond

    private:
        class BaslerCameraCameraParams_Data;
        BaslerCameraCameraParams_Data* m_pData;


    //----------------------------------------------------------------------------------------------------------------
    // References to features
    //----------------------------------------------------------------------------------------------------------------
    public:
    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Number of frames acquired in the multiframe acquisition mode - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionFrameCount" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionFrameCount;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Acquisition frame rate of the camera in frames per second - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionFrameRateAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& AcquisitionFrameRateAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Enables setting the camera's acquisition frame rate to a specified value - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionFrameRateEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& AcquisitionFrameRateEnable;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the image acquisition mode - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selecting Parameters: AcquisitionStart and AcquisitionStop

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<AcquisitionModeEnums>& AcquisitionMode;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Starts the acquisition of images - Applies to: acA1920-48gm

        Starts the acquisition of images. If the camera is set for single frame acquisition, it will start acquisition of one frame. If the camera is set for continuous frame acquisition, it will start continuous acquisition of frames.
    
        Visibility: Beginner

        Selected by: AcquisitionMode

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStart" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& AcquisitionStart;

    //@}


    //! \name Categories: AcquisitionStartEventData
    //@{
    /*!
        \brief Stream channel index of the acquisition start event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartEventStreamChannelIndex;

    //@}


    //! \name Categories: AcquisitionStartEventData
    //@{
    /*!
        \brief Time stamp of the acquisition start event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartEventTimestamp;

    //@}


    //! \name Categories: AcquisitionStartOvertriggerEventData
    //@{
    /*!
        \brief Stream channel index of the acquisition start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartOvertriggerEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartOvertriggerEventStreamChannelIndex;

    //@}


    //! \name Categories: AcquisitionStartOvertriggerEventData
    //@{
    /*!
        \brief Time stamp of the acquisition start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartOvertriggerEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartOvertriggerEventTimestamp;

    //@}


    //! \name Categories: AcquisitionStartWaitEventData
    //@{
    /*!
        \brief Stream channel index of the acquisition start wait event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartWaitEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartWaitEventStreamChannelIndex;

    //@}


    //! \name Categories: AcquisitionStartWaitEventData
    //@{
    /*!
        \brief Time stamp of the acquisition start wait event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStartWaitEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AcquisitionStartWaitEventTimestamp;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Indicates the status (true or false) of the currently selected acquisition signal - Applies to: acA1920-48gm

        Indicates the status (true or false) of the currently selected acquisition signal. The acquisition signal can be selected using AcquisitionStatusSelector.
    
        Visibility: Expert

        Selected by: AcquisitionStatusSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStatus" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& AcquisitionStatus;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the acquisition status to be checked - Applies to: acA1920-48gm

        Sets the acquisition status to be checked. Once a status has been set, the status can be checked by reading the AcquisitionStatus parameter value.
    
        Visibility: Expert

        Selecting Parameters: AcquisitionStatus

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStatusSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<AcquisitionStatusSelectorEnums>& AcquisitionStatusSelector;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Stops the acquisition of images - Applies to: acA1920-48gm

        Stops the acquisition of images if the camera is set for continuous image acquisition and acquisition has been started.
    
        Visibility: Beginner

        Selected by: AcquisitionMode

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AcquisitionStop" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& AcquisitionStop;

    //@}


    //! \name Categories: ActionControl
    //@{
    /*!
        \brief Device key used for action commands - Applies to: acA1920-48gm

        Device key used to authorize the execution of an action command. If the action device key in the camera and the action device key in the protocol message are identical, the camera will execute the corresponding action.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionDeviceKey" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionDeviceKey;

    //@}


    //! \name Categories: ActionControl
    //@{
    /*!
        \brief Group key used for action commands - Applies to: acA1920-48gm

        Group key used to define a group of devices on which action commands can be executed.
    
        Visibility: Guru

        Selected by: ActionSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionGroupKey" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionGroupKey;

    //@}


    //! \name Categories: ActionControl
    //@{
    /*!
        \brief Group mask used for action commands - Applies to: acA1920-48gm

        Group mask used to filter out a sub-group of cameras belonging to a group of cameras. The cameras belonging to a sub-group execute an action command at the same time. The filtering is done using a logical bitwise And operation against the group mask number of the action command and the group mask number of a camera. If both binary numbers have at least one common bit set to 1 (i.e. the result of the And operation is non-zero), the corresponding camera belongs to the sub-group.
    
        Visibility: Guru

        Selected by: ActionSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionGroupMask" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionGroupMask;

    //@}


    //! \name Categories: ActionLateEventData
    //@{
    /*!
        \brief Stream channel index of the action late event - Applies to: acA1920-48gm

        Stream channel index of the action late event. A action late event is raised when a scheduled action command with a timestamp in the past is received.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionLateEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionLateEventStreamChannelIndex;

    //@}


    //! \name Categories: ActionLateEventData
    //@{
    /*!
        \brief Time stamp of the action late event - Applies to: acA1920-48gm

        Time stamp of the action late event. A action late event is raised when a scheduled action command with a timestamp in the past is received.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionLateEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionLateEventTimestamp;

    //@}


    //! \name Categories: ActionControl
    //@{
    /*!
        \brief Sets the action command to be configured   - Applies to: acA1920-48gm

        Sets the action command to be configured. Because you cannot assign more than one action command to a Basler camera at a time, ActionSelector should always be set to 1.
    
        Visibility: Guru

        Selecting Parameters: ActionGroupKey and ActionGroupMask

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ActionSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ActionSelector;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Lower limit for the ExposureTime parameter when the exposure auto function is active - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoExposureTimeAbsLowerLimit" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& AutoExposureTimeAbsLowerLimit;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Upper limit for the ExposureTime parameter when the exposure auto function is active - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoExposureTimeAbsUpperLimit" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& AutoExposureTimeAbsUpperLimit;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Height of the auto function AOI (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIHeight" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoFunctionAOIHeight;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Horizontal offset from the left side of the sensor to the auto function AOI (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIOffsetX" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoFunctionAOIOffsetX;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Vertical offset from the top of the sensor to the auto function AOI (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIOffsetY" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoFunctionAOIOffsetY;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Sets which auto function AOI can be adjusted - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selecting Parameters: AutoFunctionAOIWidth, AutoFunctionAOIHeight, AutoFunctionAOIOffsetX, AutoFunctionAOIOffsetY, AutoFunctionAOIUsageIntensity and AutoFunctionAOIUsageWhiteBalance

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOISelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<AutoFunctionAOISelectorEnums>& AutoFunctionAOISelector;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Assigns the gain auto and the exposure auto functions to the currently selected auto function AOI - Applies to: acA1920-48gm

        Assigns the gain auto and the exposure auto functions to the currently selected auto function AOI. For this parameter, gain auto and exposure auto are considered as a single intensity" auto function."
    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIUsageIntensity" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& AutoFunctionAOIUsageIntensity;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Assigns the balance white auto function to the currently selected auto function AOI - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIUsageWhiteBalance" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& AutoFunctionAOIUsageWhiteBalance;

    //@}


    //! \name Categories: AutoFunctionAOIs
    //@{
    /*!
        \brief Width of the auto function AOI (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: AutoFunctionAOISelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionAOIWidth" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoFunctionAOIWidth;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Sets how gain and exposure time will be balanced when the device is making automatic adjustments - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoFunctionProfile" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<AutoFunctionProfileEnums>& AutoFunctionProfile;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Lower limit for the Gain parameter when the gain auto function is active - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoGainRawLowerLimit" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoGainRawLowerLimit;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Upper limit for the Gain parameter when the gain auto function is active - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoGainRawUpperLimit" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoGainRawUpperLimit;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Target average brightness for the gain auto function and the exposure auto function - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=AutoTargetValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& AutoTargetValue;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Value of the currently selected balance ratio channel or tap - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: BalanceRatioSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceRatioAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& BalanceRatioAbs;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Value of the currently selected balance ratio control - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: BalanceRatioSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceRatioRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& BalanceRatioRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the color channel to be adjusted for manual white balance - Applies to: acA1920-48gm

        Sets the color channel to be adjusted for manual white balance. Once a color intensity has been selected, all changes to the balance ratio parameter will be applied to the selected color intensity.
    
        Visibility: Beginner

        Selecting Parameters: BalanceRatioAbs and BalanceRatioRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceRatioSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<BalanceRatioSelectorEnums>& BalanceRatioSelector;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Balance White adjustment damping factor - Applies to: acA1920-48gm

        Balance White adjustment damping factor. The factor controls the rate by which colors are adjusted when the balance white auto function is enabled. This can be useful, for example, when objects move into the camera's view area and the light conditions are gradually changing due to the moving objects.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceWhiteAdjustmentDampingAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& BalanceWhiteAdjustmentDampingAbs;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Balance White adjustment damping factor - Applies to: acA1920-48gm

        Balance White adjustment damping factor. The factor controls the rate by which colors are adjusted when the balance white auto function is enabled. This can be useful, for example, when objects move into the camera's view area and the light conditions are gradually changing due to the moving objects.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceWhiteAdjustmentDampingRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& BalanceWhiteAdjustmentDampingRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the operation mode of the balance white auto function - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceWhiteAuto" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<BalanceWhiteAutoEnums>& BalanceWhiteAuto;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Allows returning to previous settings - Applies to: acA1920-48gm

        Allows returning to the color adjustment settings extant before the latest changes of the settings.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BalanceWhiteReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& BalanceWhiteReset;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Number of adjacent horizontal pixels to be summed - Applies to: acA1920-48gm

        Number of adjacent horizontal pixels to be summed. Their charges will be summed and reported out of the camera as a single pixel.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BinningHorizontal" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& BinningHorizontal;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Sets the binning horizontal mode - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BinningHorizontalMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<BinningHorizontalModeEnums>& BinningHorizontalMode;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Number of adjacent vertical pixels to be summed - Applies to: acA1920-48gm

        Number of adjacent vertical pixels to be summed. Their charges will be summed and reported out of the camera as a single pixel.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BinningVertical" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& BinningVertical;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Sets the binning vertical mode - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BinningVerticalMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<BinningVerticalModeEnums>& BinningVerticalMode;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Value of the selected black level control - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: BlackLevelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BlackLevelRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& BlackLevelRaw;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Sets the black level channel or tap to be adjusted - Applies to: acA1920-48gm

        Sets the black level channel or tap to be adjusted. Once a black level channel or tap has been selected, all changes to the BlackLevel parameter will be applied to the selected channel or tap.
    
        Visibility: Beginner

        Selecting Parameters: BlackLevelRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=BlackLevelSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<BlackLevelSelectorEnums>& BlackLevelSelector;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Enables horizontal centering of the image - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CenterX" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& CenterX;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Enables vertical centering of the image - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CenterY" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& CenterY;

    //@}


    //! \name Categories: ChunkDataStreams
    //@{
    /*!
        \brief Enables the inclusion of the currently selected chunk in the payload data - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: ChunkSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ChunkEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ChunkEnable;

    //@}


    //! \name Categories: ChunkDataStreams
    //@{
    /*!
        \brief Enables the chunk mode - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ChunkModeActive" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ChunkModeActive;

    //@}


    //! \name Categories: ChunkDataStreams
    //@{
    /*!
        \brief Sets the chunk to be enabled - Applies to: acA1920-48gm

        Sets the chunk to be enabled. Once a chunk has been set, the chunk can be enabled using the ChunkEnable parameter.
    
        Visibility: Beginner

        Selecting Parameters: ChunkEnable

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ChunkSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ChunkSelectorEnums>& ChunkSelector;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Clears the last error   - Applies to: acA1920-48gm

        Clears the last error. If a previous error exists, the previous error can be retrieved.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ClearLastError" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& ClearLastError;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Enables color adjustment - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ColorAdjustmentEnable;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Hue adjustment value for the currently selected color - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: ColorAdjustmentSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentHue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ColorAdjustmentHue;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Adjustment of hue for the selected color - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: ColorAdjustmentSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentHueRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ColorAdjustmentHueRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Allows returning to previous settings - Applies to: acA1920-48gm

        Allows returning to the color adjustment settings extant before the latest changes of the settings.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& ColorAdjustmentReset;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Saturation adjustment value for the currently selected color - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: ColorAdjustmentSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentSaturation" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ColorAdjustmentSaturation;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Adjustment of saturation for the selected color - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: ColorAdjustmentSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentSaturationRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ColorAdjustmentSaturationRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the color for color adjustment - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selecting Parameters: ColorAdjustmentHue, ColorAdjustmentHueRaw, ColorAdjustmentSaturation and ColorAdjustmentSaturationRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorAdjustmentSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ColorAdjustmentSelectorEnums>& ColorAdjustmentSelector;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Extent to which the selected light source will be considered in color matrix transformation - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationMatrixFactor" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ColorTransformationMatrixFactor;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Extent to which the selected light source will be considered in color matrix transformation - Applies to: acA1920-48gm

        Extent to which the selected light source will be considered in color matrix transformation. If the value is set to 65536, the selected light source will be fully considered. If the value is set to 0, the selected light source will not be considered.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationMatrixFactorRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ColorTransformationMatrixFactorRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the type of color transformation to be performed - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selecting Parameters: LightSourceSelector, ColorTransformationValueSelector and ColorTransformationValue

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ColorTransformationSelectorEnums>& ColorTransformationSelector;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Transformation value for the selected element in the color transformation matrix - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: ColorTransformationSelector and ColorTransformationValueSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ColorTransformationValue;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Raw transformation value for the selected element in the color transformation matrix - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: ColorTransformationValueSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationValueRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ColorTransformationValueRaw;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the element to be entered in the color transformation matrix - Applies to: acA1920-48gm

        Sets the element to be entered in the color transformation matrix for custom color transformation. Note: Depending on the camera model, some elements in the color transformation matrix may be preset and can not be changed.
    
        Visibility: Guru

        Selected by: ColorTransformationSelector

        Selecting Parameters: ColorTransformationValue and ColorTransformationValueRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ColorTransformationValueSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ColorTransformationValueSelectorEnums>& ColorTransformationValueSelector;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the event that increments the currently selected counter - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: CounterSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CounterEventSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<CounterEventSourceEnums>& CounterEventSource;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Immediately resets the selected counter - Applies to: acA1920-48gm

        Immediately resets the selected counter. The counter starts counting immediately after the reset.
    
        Visibility: Expert

        Selected by: CounterSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CounterReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& CounterReset;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the source signal that can reset the currently selected counter - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: CounterSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CounterResetSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<CounterResetSourceEnums>& CounterResetSource;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the counter to be configured - Applies to: acA1920-48gm

        Sets the counter to be configured. Once a counter has been set, all changes to the counter settings will be applied to this counter.
    
        Visibility: Expert

        Selecting Parameters: CounterEventSource, CounterReset and CounterResetSource

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CounterSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<CounterSelectorEnums>& CounterSelector;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Indicates whether the critical temperature has been reached - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CriticalTemperature" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& CriticalTemperature;

    //@}


    //! \name Categories: CriticalTemperatureEventData
    //@{
    /*!
        \brief Stream channel index of the critical temperature event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CriticalTemperatureEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& CriticalTemperatureEventStreamChannelIndex;

    //@}


    //! \name Categories: CriticalTemperatureEventData
    //@{
    /*!
        \brief Time stamp of the critical temperature event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=CriticalTemperatureEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& CriticalTemperatureEventTimestamp;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Horizontal decimation factor - Applies to: acA1920-48gm

        Horizontal decimation factor. It specifies the extent of horizontal sub-sampling of the acquired frame, i.e. it defines how many pixel columns are left out of transmission. This has the net effect of reducing the horizontal resolution (width) of the image by the specified decimation factor. A value of 1 indicates that the camera performs no horizontal decimation.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DecimationHorizontal" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& DecimationHorizontal;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Vertical decimation factor - Applies to: acA1920-48gm

        Vertical decimation factor. It specifies the extent of vertical sub-sampling of the acquired frame, i.e. it defines how many rows are left out of transmission. This has the net effect of reducing the vertical resolution (height) of the image by the specified decimation factor. A value of 1 indicates that the camera performs no vertical decimation.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DecimationVertical" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& DecimationVertical;

    //@}


    //! \name Categories: PGIControl
    //@{
    /*!
        \brief Sets the demosaicing mode - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DemosaicingMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<DemosaicingModeEnums>& DemosaicingMode;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Version of the device's firmware - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceFirmwareVersion" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceFirmwareVersion;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief ID of the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceID" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceID;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Additional information from the vendor about the camera - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceManufacturerInfo" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceManufacturerInfo;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Model name of the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceModelName" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceModelName;

    //@}


    //! \name Categories: DeviceControl
    //@{
    /*!
        \brief Announce the end of registers streaming - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceRegistersStreamingEnd" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& DeviceRegistersStreamingEnd;

    //@}


    //! \name Categories: DeviceControl
    //@{
    /*!
        \brief Prepare the device for registers streaming - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceRegistersStreamingStart" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& DeviceRegistersStreamingStart;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Immediately resets and reboots the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& DeviceReset;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Returns the scan type of the device's sensor (area or line scan) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceScanType" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<DeviceScanTypeEnums>& DeviceScanType;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief User-settable ID of the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceUserID" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceUserID;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Name of the device's vendor - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceVendorName" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceVendorName;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Version of the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DeviceVersion" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& DeviceVersion;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Value set for digital shift - Applies to: acA1920-48gm

        Value set for digital shift. When the parameter is set to zero, digital shift will be disabled. When the parameter is set to 1, 2, 3, or 4, digital shift will be set to shift by 1, shift by 2, shift by 3, or shift by 4 respectively.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=DigitalShift" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& DigitalShift;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Enables burst acquisition - Applies to: acA1920-48gm

        Enables burst acquisition. When enabled, the maximum frame rate only depends on sensor timing and timing of the trigger sequence, and not on the image transfer rate out of the camera.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EnableBurstAcquisition" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& EnableBurstAcquisition;

    //@}


    //! \name Categories: EventsGeneration
    //@{
    /*!
        \brief Enables event notifications for the currently selected event - Applies to: acA1920-48gm

        Enables event notifications for the currently selected event. The event can selected using the EventSelector parameter.
    
        Visibility: Beginner

        Selected by: EventSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EventNotification" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<EventNotificationEnums>& EventNotification;

    //@}


    //! \name Categories: EventOverrunEventData
    //@{
    /*!
        \brief Frame ID for an event overrun event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EventOverrunEventFrameID" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& EventOverrunEventFrameID;

    //@}


    //! \name Categories: EventOverrunEventData
    //@{
    /*!
        \brief Stream channel index of the event overrun event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EventOverrunEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& EventOverrunEventStreamChannelIndex;

    //@}


    //! \name Categories: EventOverrunEventData
    //@{
    /*!
        \brief Time stamp of the event overrun event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EventOverrunEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& EventOverrunEventTimestamp;

    //@}


    //! \name Categories: EventsGeneration
    //@{
    /*!
        \brief Sets the event notification to be enabled - Applies to: acA1920-48gm

        Sets the event notification to be enabled. Once an event notification has been set, the notification can be enabled using the EventNotification parameter.
    
        Visibility: Beginner

        Selecting Parameters: EventNotification

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=EventSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<EventSelectorEnums>& EventSelector;

    //@}


    //! \name Categories: ExpertFeatureAccess
    //@{
    /*!
        \brief Key to access the selected expert feature - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: ExpertFeatureAccessSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExpertFeatureAccessKey" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExpertFeatureAccessKey;

    //@}


    //! \name Categories: ExpertFeatureAccess
    //@{
    /*!
        \brief Sets the expert feature to be configured - Applies to: acA1920-48gm

        Sets the expert feature to be configured. Once a feature has been set, all changes made using the feature enable feature will be applied to this feature.
    
        Visibility: Guru

        Selecting Parameters: ExpertFeatureEnable and ExpertFeatureAccessKey

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExpertFeatureAccessSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ExpertFeatureAccessSelectorEnums>& ExpertFeatureAccessSelector;

    //@}


    //! \name Categories: ExpertFeatureAccess
    //@{
    /*!
        \brief Enables the currently selected expert feature - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: ExpertFeatureAccessSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExpertFeatureEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ExpertFeatureEnable;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the operation mode of the exposure auto function - Applies to: acA1920-48gm

        Sets the operation mode of the exposure auto function. The exposure auto function automatically adjusts the exposure time within set limits until a target brightness value is reached.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureAuto" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ExposureAutoEnums>& ExposureAuto;

    //@}


    //! \name Categories: ExposureEndEventData
    //@{
    /*!
        \brief Frame ID for an exposure end event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureEndEventFrameID" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExposureEndEventFrameID;

    //@}


    //! \name Categories: ExposureEndEventData
    //@{
    /*!
        \brief Stream channel index of the exposure end event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureEndEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExposureEndEventStreamChannelIndex;

    //@}


    //! \name Categories: ExposureEndEventData
    //@{
    /*!
        \brief Time stamp of the exposure end event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureEndEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExposureEndEventTimestamp;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the exposure mode - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ExposureModeEnums>& ExposureMode;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Maximum overlap of the sensor exposure with sensor readout in TriggerWidth exposure mode (in microseconds) - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureOverlapTimeMaxAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ExposureOverlapTimeMaxAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Maximum overlap time of the sensor exposure with sensor readout in TriggerWidth exposure mode (in raw units) - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureOverlapTimeMaxRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExposureOverlapTimeMaxRaw;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the exposure overlap time mode - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureOverlapTimeMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ExposureOverlapTimeModeEnums>& ExposureOverlapTimeMode;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Exposure time of the camera in microseconds - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureTimeAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ExposureTimeAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Raw exposure time of the camera - Applies to: acA1920-48gm

        Raw exposure time of the camera. This value sets an integer that will be used as a multiplier for the exposure timebase. The actual exposure time equals the current ExposureTimeRaw setting multiplied with the current ExposureTimeBaseAbs setting.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ExposureTimeRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& ExposureTimeRaw;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Access buffer for file operations - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: FileSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileAccessBuffer" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IRegisterEx& FileAccessBuffer;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief File access length - Applies to: acA1920-48gm

        File access length. Controls the mapping between the device file storage and the FileAccessBuffer.
    
        Visibility: Guru

        Selected by: FileSelector and FileOperationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileAccessLength" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FileAccessLength;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief File access offset - Applies to: acA1920-48gm

        File access offset. Controls the mapping between the device file storage and the FileAccessBuffer.
    
        Visibility: Guru

        Selected by: FileSelector and FileOperationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileAccessOffset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FileAccessOffset;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Sets the access mode in which a file is opened in the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: FileSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileOpenMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<FileOpenModeEnums>& FileOpenMode;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Executes the operation selected by FileOperationSelector - Applies to: acA1920-48gm

        Executes the operation selected by FileOperationSelector on the selected file.
    
        Visibility: Guru

        Selected by: FileSelector and FileOperationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileOperationExecute" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& FileOperationExecute;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief File operation result - Applies to: acA1920-48gm

        File operation result. For read or write operations, the number of successfully read/written bytes is returned.
    
        Visibility: Guru

        Selected by: FileSelector and FileOperationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileOperationResult" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FileOperationResult;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Sets the target operation for the currently selected file - Applies to: acA1920-48gm

        Sets the target operation for the currently selected file. After an operation has been selected, the operation can be executed using the FileOperationExecute command.
    
        Visibility: Guru

        Selected by: FileSelector

        Selecting Parameters: FileAccessOffset, FileAccessLength, FileOperationStatus, FileOperationResult and FileOperationExecute

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileOperationSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<FileOperationSelectorEnums>& FileOperationSelector;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Returns the file operation execution status - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: FileSelector and FileOperationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileOperationStatus" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<FileOperationStatusEnums>& FileOperationStatus;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Sets the target file in the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selecting Parameters: FileOperationSelector, FileOpenMode, FileAccessBuffer, FileAccessOffset, FileAccessLength, FileOperationStatus, FileOperationResult, FileSize and FileOperationExecute

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<FileSelectorEnums>& FileSelector;

    //@}


    //! \name Categories: FileAccessControl
    //@{
    /*!
        \brief Size of the currently selected file in bytes - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: FileSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FileSize" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FileSize;

    //@}


    //! \name Categories: FrameStartEventData
    //@{
    /*!
        \brief Stream channel index of the frame start event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartEventStreamChannelIndex;

    //@}


    //! \name Categories: FrameStartEventData
    //@{
    /*!
        \brief Time stamp of the frame start event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartEventTimestamp;

    //@}


    //! \name Categories: FrameStartOvertriggerEventData
    //@{
    /*!
        \brief Stream channel index of the frame start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartOvertriggerEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartOvertriggerEventStreamChannelIndex;

    //@}


    //! \name Categories: FrameStartOvertriggerEventData
    //@{
    /*!
        \brief Time stamp of the frame start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartOvertriggerEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartOvertriggerEventTimestamp;

    //@}


    //! \name Categories: FrameStartWaitEventData
    //@{
    /*!
        \brief Stream channel index of the frame start wait event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartWaitEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartWaitEventStreamChannelIndex;

    //@}


    //! \name Categories: FrameStartWaitEventData
    //@{
    /*!
        \brief Time stamp of the frame start wait event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameStartWaitEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameStartWaitEventTimestamp;

    //@}


    //! \name Categories: FrameTimeoutEventData
    //@{
    /*!
        \brief Stream channel index of the frame timeout event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameTimeoutEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameTimeoutEventStreamChannelIndex;

    //@}


    //! \name Categories: FrameTimeoutEventData
    //@{
    /*!
        \brief Time stamp of the frame timeout event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=FrameTimeoutEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& FrameTimeoutEventTimestamp;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Sets the operation mode of the gain auto function - Applies to: acA1920-48gm

        Sets the operation mode of the gain auto function. The gain auto function automatically adjusts the gain within set limits until a target brightness value is reached.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GainAuto" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GainAutoEnums>& GainAuto;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Raw value of the selected gain control - Applies to: acA1920-48gm

        Raw value of the selected gain control. The raw value is an integer value that sets the selected gain control in units specific to the camera.
    
        Visibility: Beginner

        Selected by: GainSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GainRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GainRaw;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Sets the gain channel or tap to be adjusted - Applies to: acA1920-48gm

        Sets the gain channel or tap to be adjusted. Once a gain channel or tap has been selected, all changes to the Gain parameter will be applied to the selected channel or tap.
    
        Visibility: Beginner

        Selecting Parameters: GainRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GainSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GainSelectorEnums>& GainSelector;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Gamma correction value - Applies to: acA1920-48gm

        Gamma correction value. Gamma correction lets you modify the brightness of the pixel values to account for a non-linearity in the human perception of brightness.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Gamma" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& Gamma;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Enables gamma correction - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GammaEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GammaEnable;

    //@}


    //! \name Categories: AnalogControls
    //@{
    /*!
        \brief Sets the type of gamma to apply - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GammaSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GammaSelectorEnums>& GammaSelector;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Sets the control channel privilege feature - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevCCP" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GevCCPEnums>& GevCCP;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Current default gateway for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevCurrentDefaultGateway" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevCurrentDefaultGateway;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Current IP address for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevCurrentIPAddress" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevCurrentIPAddress;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Current IP configuration of the selected network interface - Applies to: acA1920-48gm

        IP configuration of the selected network interface, e.g. fixed IP, DHCP, or auto IP.
    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevCurrentIPConfiguration" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevCurrentIPConfiguration;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Current subnet mask for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevCurrentSubnetMask" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevCurrentSubnetMask;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Character set used by all strings of the bootstrap registers - Applies to: acA1920-48gm

        Character set used by all strings of the bootstrap registers (1 = UTF8).
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevDeviceModeCharacterSet" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevDeviceModeCharacterSet;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the bootstrap register is in big-endian format - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevDeviceModeIsBigEndian" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevDeviceModeIsBigEndian;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief First URL reference to the GenICam XML file   - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevFirstURL" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& GevFirstURL;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Heartbeat timeout in milliseconds - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevHeartbeatTimeout" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevHeartbeatTimeout;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Enables the IEEE 1588 V2 Precision Time Protocol for the timestamp register - Applies to: acA1920-48gm

        Enables the IEEE 1588 V2 Precision Time Protocol for the timestamp register. Only available when the IEEE1588_support bit of the GVCP Capability register is set. When PTP is enabled, the Timestamp Control register cannot be used to reset the timestamp. Factory default is device specific. When PTP is enabled or disabled, the value of Timestamp Tick Frequency and Timestamp Value registers might change to reflect the new time domain.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevIEEE1588;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latched clock ID of the IEEE 1588 device - Applies to: acA1920-48gm

        Latched clock ID of the IEEE 1588 device. (The clock ID must first be latched using the IEEE 1588 Latch command.) The clock ID is an array of eight octets which is displayed as hexadecimal number. Leading zeros are omitted.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588ClockId" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevIEEE1588ClockId;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latches the current IEEE 1588 related values of the device - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588DataSetLatch" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& GevIEEE1588DataSetLatch;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latched offset from the IEEE 1588 master clock in nanoseconds   - Applies to: acA1920-48gm

        Latched offset from the IEEE 1588 master clock in nanoseconds. (The offset must first be latched using the IEEE 1588 Latch command.)
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588OffsetFromMaster" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevIEEE1588OffsetFromMaster;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latched parent clock ID of the IEEE 1588 device - Applies to: acA1920-48gm

        Latched parent clock ID of the IEEE 1588 device. (The parent clock ID must first be latched using the IEEE 1588 Latch command.) The parent clock ID is the clock ID of the current master clock. A clock ID is an array of eight octets which is displayed as hexadecimal number. Leading zeros are omitted.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588ParentClockId" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevIEEE1588ParentClockId;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Returns the state of the IEEE 1588 clock - Applies to: acA1920-48gm

        Provides the state of the IEEE 1588 clock. Values of this field must match the IEEE 1588 PTP port state enumeration (INITIALIZING, FAULTY, DISABLED, LISTENING, PRE_MASTER, MASTER, PASSIVE, UNCALIBRATED, SLAVE). Please refer to IEEE 1588 for additional information.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588Status" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GevIEEE1588StatusEnums>& GevIEEE1588Status;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Returns the latched state of the IEEE 1588 clock - Applies to: acA1920-48gm

        Returns the latched state of the IEEE 1588 clock. (The state must first be latched using the IEEE 1588 Latch command.) The state is indicated by values 1 to 9, corresponding to the states INITIALIZING, FAULTY, DISABLED, LISTENING, PRE_MASTER, MASTER, PASSIVE, UNCALIBRATED, and SLAVE. Refer to the IEEE 1588 specification for additional information.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevIEEE1588StatusLatched" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GevIEEE1588StatusLatchedEnums>& GevIEEE1588StatusLatched;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Sets the physical network interface to be configured - Applies to: acA1920-48gm

        Sets the physical network interface to be configured. Once a network interface has been selected, all changes to the network interface settings will be applied to the selected interface.
    
        Visibility: Guru

        Selecting Parameters: GevMACAddress, GevSupportedOptionalLegacy16BitBlockID, GevSupportedIPConfigurationLLA, GevSupportedIPConfigurationDHCP, GevSupportedIPConfigurationPersistentIP, GevCurrentIPConfiguration, GevCurrentIPAddress, GevCurrentSubnetMask, GevCurrentDefaultGateway, GevPersistentIPAddress, GevPersistentSubnetMask, GevPersistentDefaultGateway, GevLinkSpeed, GevLinkMaster, GevLinkFullDuplex and GevLinkCrossover

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevInterfaceSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GevInterfaceSelectorEnums>& GevInterfaceSelector;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates the state of medium-dependent interface crossover (MDIX) for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevLinkCrossover" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevLinkCrossover;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the selected network interface operates in full-duplex mode - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevLinkFullDuplex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevLinkFullDuplex;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the selected network interface is the clock master - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevLinkMaster" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevLinkMaster;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Connection speed in Mbps for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevLinkSpeed" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevLinkSpeed;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief MAC address for the selected network interface - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevMACAddress" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevMACAddress;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Number of message channels supported by the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevMessageChannelCount" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevMessageChannelCount;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Number of network interfaces on the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevNumberOfInterfaces" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevNumberOfInterfaces;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Fixed default gateway for the selected network interface - Applies to: acA1920-48gm

        Fixed default gateway for the selected network interface (if fixed IP addressing is supported by the device and enabled).
    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevPersistentDefaultGateway" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevPersistentDefaultGateway;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Fixed IP address for the selected network interface - Applies to: acA1920-48gm

        Fixed IP address for the selected network interface (if fixed IP addressing is supported by the device and enabled).
    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevPersistentIPAddress" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevPersistentIPAddress;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Fixed subnet mask for the selected network interface - Applies to: acA1920-48gm

        Fixed subnet mask for the selected network interface (if fixed IP addressing is supported by the device and enabled).
    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevPersistentSubnetMask" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevPersistentSubnetMask;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Base bandwidth in bytes per second that will be used by the camera to transmit image and chunk feature data and to handle resends and control data transmissions - Applies to: acA1920-48gm

        Base bandwidth in bytes per second that will be used by the camera to transmit image and chunk feature data and to handle resends and control data transmissions. This parameter represents a combination of the packet size and the inter-packet delay.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCBWA" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCBWA;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Percentage of the Ethernet bandwidth assigned to the camera to be held in reserve - Applies to: acA1920-48gm

        Percentage of the Ethernet bandwidth assigned to the camera to be held in reserve for packet resends and for the transmission of control data between the camera and the host PC. The setting is expressed as a percentage of the bandwidth assigned parameter. For example, if the Bandwidth Assigned parameter indicates that 30 MBytes/s have been assigned to the camera and the Bandwidth Reserve parameter is set to 5%, the bandwidth reserve will be 1.5 MBytes/s.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCBWR" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCBWR;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Multiplier for the Bandwidth Reserve parameter   - Applies to: acA1920-48gm

        Multiplier for the Bandwidth Reserve parameter. The multiplier is used to establish an extra pool of reserved bandwidth that can be used if an unusually large burst of packet resends is needed.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCBWRA" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCBWRA;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Stream channel destination IPv4 address for the selected stream channel - Applies to: acA1920-48gm

        Stream channel destination IPv4 address for the selected stream channel. The destination can be a unicast or a multicast.
    
        Visibility: Guru

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCDA" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCDA;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Actual bandwidth (in bytes per second) that the camera will use to transmit image data and chunk data - Applies to: acA1920-48gm

        Actual bandwidth (in bytes per second) that the camera will use to transmit image data and chunk data given the current AOI settings, chunk feature settings, and the pixel format setting.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCDCT" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCDCT;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Maximum amount of data (in bytes per second) that the camera could generate - Applies to: acA1920-48gm

        Maximum amount of data (in bytes per second) that the camera could generate given its current settings and ideal conditions, i.e., unlimited bandwidth and no packet resends.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCDMT" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCDMT;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Maximum time (in ticks) that the next frame transmission could be delayed due to a burst of resends   - Applies to: acA1920-48gm

        Maximum time (in ticks) that the next frame transmission could be delayed due to a burst of resends. If the Bandwidth Reserve Accumulation parameter is set to a high value, the camera can experience periods where there is a large burst of data resends. This burst of resends will delay the start of transmission of the next acquired image. 
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCFJM" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCFJM;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Frame transmission delay for the selected stream channel - Applies to: acA1920-48gm

        Frame transmission delay for the selected stream channel (in ticks). This value sets a delay before transmitting the acquired image.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCFTD" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCFTD;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Delay between the transmission of each packet for the selected stream channel - Applies to: acA1920-48gm

        Delay between the transmission of each packet for the selected stream channel. The delay is measured in ticks.
    
        Visibility: Expert

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPD" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCPD;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Port to which the device must send data streams - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPHostPort" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCPHostPort;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Index of the network interface to use - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPInterfaceIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCPInterfaceIndex;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Returns the endianess of multi-byte pixel data for this stream - Applies to: acA1920-48gm

        Returns the endianess of multi-byte pixel data for this stream. True = big endian.
    
        Visibility: Guru

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPSBigEndian" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSCPSBigEndian;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Disables IP fragmentation of packets on the stream channel - Applies to: acA1920-48gm

        Disables IP fragmentation of packets on the stream channel.  This bit is copied into the "do not fragment" bit of the IP header of each stream packet.
    
        Visibility: Guru

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPSDoNotFragment" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSCPSDoNotFragment;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Packet size in bytes for the selected stream channel  Excludes data leader and data trailer - Applies to: acA1920-48gm

        Packet size in bytes for the selected stream channel. Excludes data leader and data trailer. (The last packet may be smaller because the packet size is not necessarily a multiple of the block size for the stream channel.)
    
        Visibility: Beginner

        Selected by: GevStreamChannelSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSCPSPacketSize" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevSCPSPacketSize;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Second URL reference to the GenICam XML file   - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSecondURL" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IStringEx& GevSecondURL;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Number of stream channels supported by the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevStreamChannelCount" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevStreamChannelCount;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Sets the stream channel to be configured - Applies to: acA1920-48gm

        Sets the stream channels to be configured. Once a stream channel has been selected, all changes to the stream channel settings will be applied to the selected stream channel.
    
        Visibility: Guru

        Selecting Parameters: GevSCPInterfaceIndex, GevGVSPExtendedIDMode, GevSCPHostPort, GevSCPSFireTestPacket, GevSCPSDoNotFragment, GevSCPSBigEndian, GevSCPSPacketSize, GevSCPD, GevSCFTD, GevSCDA, GevSCBWR, GevSCBWRA, GevSCBWA, GevSCDMT, GevSCDCT and GevSCFJM

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevStreamChannelSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<GevStreamChannelSelectorEnums>& GevStreamChannelSelector;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the IEEE 1588 V2 Precision Time Protocol (PTP) is supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedIEEE1588" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedIEEE1588;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the selected network interface supports DHCP IP addressing - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedIPConfigurationDHCP" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedIPConfigurationDHCP;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the selected network interface supports auto IP addressing (also known as LLA) - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedIPConfigurationLLA" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedIPConfigurationLLA;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether the selected network interface supports fixed IP addressing (also known as persistent IP addressing) - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedIPConfigurationPersistentIP" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedIPConfigurationPersistentIP;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether multiple operations in a single message are supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalCommandsConcatenation" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalCommandsConcatenation;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether EVENT_CMD and EVENT_ACK are supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalCommandsEVENT" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalCommandsEVENT;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether EVENTDATA_CMD and EVENTDATA_ACK are supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalCommandsEVENTDATA" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalCommandsEVENTDATA;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether PACKETRESEND_CMD is supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalCommandsPACKETRESEND" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalCommandsPACKETRESEND;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether WRITEMEM_CMD and WRITEMEM_ACK are supported - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalCommandsWRITEMEM" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalCommandsWRITEMEM;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Indicates whether this GVSP transmitter or receiver can support 16-bit block_id - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: GevInterfaceSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevSupportedOptionalLegacy16BitBlockID" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& GevSupportedOptionalLegacy16BitBlockID;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latches the current timestamp value of the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevTimestampControlLatch" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& GevTimestampControlLatch;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Resets the timestamp control latch - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevTimestampControlLatchReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& GevTimestampControlLatchReset;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Resets the timestamp value for the device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevTimestampControlReset" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& GevTimestampControlReset;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Number of timestamp clock ticks in 1 second - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevTimestampTickFrequency" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevTimestampTickFrequency;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Latched value of the timestamp - Applies to: acA1920-48gm

        Latched value of the timestamp. (The timestamp must first be latched using the Timestamp Control Latch command.)
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevTimestampValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevTimestampValue;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Major version number of the GigE Vision specification supported by this device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevVersionMajor" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevVersionMajor;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Minor version number of the GigE Vision specification supported by this device - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GevVersionMinor" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GevVersionMinor;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Gray value adjustment damping factor - Applies to: acA1920-48gm

        Gray value adjustment damping factor. The factor controls the rate by which pixel gray values are changed when the exposure auto function or the gain auto function or both are enabled. This can be useful, for example, when objects move into the camera's view area and the light conditions are gradually changing due to the moving objects.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GrayValueAdjustmentDampingAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& GrayValueAdjustmentDampingAbs;

    //@}


    //! \name Categories: AutoFunctions
    //@{
    /*!
        \brief Gray value adjustment damping factor - Applies to: acA1920-48gm

        Gray value adjustment damping factor. The factor controls the rate by which pixel gray values are changed when the exposure auto function or the gain auto function or both are enabled. This can be useful, for example, when objects move into the camera's view area and the light conditions are gradually changing due to the moving objects.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=GrayValueAdjustmentDampingRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& GrayValueAdjustmentDampingRaw;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Height of the area of interest in pixels - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Height" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Height;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Maximum allowed height of the image in pixels - Applies to: acA1920-48gm

        Maximum allowed height of the image in pixels, taking into account any function that may limit the allowed height.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=HeightMax" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& HeightMax;

    //@}


    //! \name Categories: LUTControls
    //@{
    /*!
        \brief Enables the selected lookup table (LUT) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LUTSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LUTEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& LUTEnable;

    //@}


    //! \name Categories: LUTControls
    //@{
    /*!
        \brief Index of the LUT element to access - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LUTSelector

        Selecting Parameters: LUTValue

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LUTIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& LUTIndex;

    //@}


    //! \name Categories: LUTControls
    //@{
    /*!
        \brief Sets the lookup table (LUT) to be configured - Applies to: acA1920-48gm

        Sets the lookup table (LUT) to be configured. Once a LUT has been selected, all changes to the LUT settings will be applied to the selected LUT.
    
        Visibility: Beginner

        Selecting Parameters: LUTEnable, LUTIndex, LUTValue and LUTValueAll

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LUTSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LUTSelectorEnums>& LUTSelector;

    //@}


    //! \name Categories: LUTControls
    //@{
    /*!
        \brief Value of the LUT element at the LUT index position - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LUTSelector and LUTIndex

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LUTValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& LUTValue;

    //@}


    //! \name Categories: LUTControls
    //@{
    /*!
        \brief A single register that lets you access all LUT coefficients - Applies to: acA1920-48gm

        A single register that lets you access all LUT coefficients without the need to repeatedly use the LUTIndex parameter.
    
        Visibility: Expert

        Selected by: LUTSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LUTValueAll" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IRegisterEx& LUTValueAll;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Returns the last occurred error - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LastError" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LastErrorEnums>& LastError;

    //@}


    //! \name Categories: ColorImprovementsControl
    //@{
    /*!
        \brief Sets the type of light source to be considered for matrix color transformation - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selected by: ColorTransformationSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LightSourceSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LightSourceSelectorEnums>& LightSourceSelector;

    //@}


    //! \name Categories: Line1RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the I/O line 1 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line1RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line1RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: Line1RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the line 1 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line1RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line1RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: Line2RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the I/O line 2 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line2RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line2RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: Line2RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the line 2 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line2RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line2RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: Line3RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the I/O line 3 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line3RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line3RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: Line3RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the line 3 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line3RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line3RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: Line4RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the I/O line 4 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line4RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line4RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: Line4RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the line 4 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Line4RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Line4RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Value of the selected line debouncer time in microseconds - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineDebouncerTimeAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& LineDebouncerTimeAbs;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Returns the electrical configuration of the currently selected line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineFormat" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LineFormatEnums>& LineFormat;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Enables the signal inverter function for the currently selected input or output line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineInverter" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& LineInverter;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Returns the line logic of the currently selected line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineLogic" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LineLogicEnums>& LineLogic;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Sets the mode for the selected line - Applies to: acA1920-48gm

        Sets the mode for the selected line. This controls whether the physical line is used to input or output a signal.
    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LineModeEnums>& LineMode;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Sets the I/O line to be configured - Applies to: acA1920-48gm

        Sets the I/O line to be configured. Once a line has been set, all changes to the line settings will be applied to the selected line.
    
        Visibility: Beginner

        Selecting Parameters: LineMode, LineDebouncerTimeAbs, LineDebouncerTimeRaw, LineInverter, LineTermination, LineStatus, LineSource, LineFormat, MinOutPulseWidthAbs and MinOutPulseWidthRaw

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LineSelectorEnums>& LineSelector;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Sets the source signal for the currently selected line - Applies to: acA1920-48gm

        Sets the source signal for the currently selected line. The currently selected line must be an output line.
    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<LineSourceEnums>& LineSource;

    //@}


    //! \name Categories: LineStartOvertriggerEventData
    //@{
    /*!
        \brief Stream channel index of the line start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineStartOvertriggerEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& LineStartOvertriggerEventStreamChannelIndex;

    //@}


    //! \name Categories: LineStartOvertriggerEventData
    //@{
    /*!
        \brief Time stamp of the line start overtrigger event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineStartOvertriggerEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& LineStartOvertriggerEventTimestamp;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Indicates the current logical state of the selected line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineStatus" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& LineStatus;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief A single bit field indicating the current logical state of all available line signals at time of polling - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineStatusAll" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& LineStatusAll;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Enables the termination resistor of the selected input line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=LineTermination" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& LineTermination;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Value for the minimum signal width of an output signal (in microseconds)  - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: LineSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=MinOutPulseWidthAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& MinOutPulseWidthAbs;

    //@}


    //! \name Categories: PGIControl
    //@{
    /*!
        \brief Amount of noise reduction to apply - Applies to: acA1920-48gm

        Amount of noise reduction to apply. The higher the value, the less chroma noise will be visible in your images. However, too high values may result in image information loss. To enable this feature, the DemosaicingMode parameter must be set to BaslerPGI.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=NoiseReductionAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& NoiseReductionAbs;

    //@}


    //! \name Categories: PGIControl
    //@{
    /*!
        \brief Amount of noise reduction to apply - Applies to: acA1920-48gm

        Amount of noise reduction to apply. The higher the value, the less chroma noise will be visible in your images. However, too high values may result in image information loss. To enable this feature, the DemosaicingMode parameter must be set to BaslerPGI.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=NoiseReductionRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& NoiseReductionRaw;

    //@}


    //! \name Categories: ActionControl
    //@{
    /*!
        \brief Number of separate action signals supported by the device - Applies to: acA1920-48gm

        Number of separate action signals supported by the device. Determines how many action signals the device can handle in parallel, i.e. how many different action commands can be set up for the device.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=NumberOfActionSignals" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& NumberOfActionSignals;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Horizontal offset from the left side of the sensor to the area of interest (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=OffsetX" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& OffsetX;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Vertical offset from the top of the sensor to the area of interest (in pixels) - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=OffsetY" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& OffsetY;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief An over temperature state has been detected - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=OverTemperature" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& OverTemperature;

    //@}


    //! \name Categories: OverTemperatureEventData
    //@{
    /*!
        \brief Stream channel index of the over temperature event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=OverTemperatureEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& OverTemperatureEventStreamChannelIndex;

    //@}


    //! \name Categories: OverTemperatureEventData
    //@{
    /*!
        \brief Time stamp of the over temperature event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=OverTemperatureEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& OverTemperatureEventTimestamp;

    //@}


    //! \name Categories: RemoveParamLimits
    //@{
    /*!
        \brief Sets the parameter whose factory limits should be removed - Applies to: acA1920-48gm

        Sets the parameter whose factory limits should be removed. Once a parameter has been set, the factory limits can be removed using RemoveLimits.
    
        Visibility: Guru

        Selecting Parameters: RemoveLimits

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ParameterSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ParameterSelectorEnums>& ParameterSelector;

    //@}


    //! \name Categories: TransportLayer
    //@{
    /*!
        \brief Size of the payload in bytes - Applies to: acA1920-48gm

        Size of the payload in bytes. This is the total number of bytes sent in the payload. Image data + chunk data if present. No packet headers.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PayloadSize" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& PayloadSize;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Returns the alignment of the camera's Bayer filter to the pixels in the acquired images - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PixelColorFilter" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<PixelColorFilterEnums>& PixelColorFilter;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Maximum possible pixel value that could be transferred from the camera - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PixelDynamicRangeMax" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& PixelDynamicRangeMax;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Minimum possible pixel value that could be transferred from the camera - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PixelDynamicRangeMin" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& PixelDynamicRangeMin;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Sets the format of the pixel data transmitted by the camera - Applies to: acA1920-48gm

        Sets the format of the pixel data transmitted by the camera. The available pixel formats depend on the camera model and whether the camera is monochrome or color.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PixelFormat" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<PixelFormatEnums>& PixelFormat;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Returns the depth of the pixel values in the image (in bits per pixel) - Applies to: acA1920-48gm

        Returns the depth of the pixel values in the image (in bits per pixel). The value will always be coherent with the pixel format setting.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=PixelSize" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<PixelSizeEnums>& PixelSize;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sensor readout time given the current settings - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ReadoutTimeAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ReadoutTimeAbs;

    //@}


    //! \name Categories: RemoveParamLimits
    //@{
    /*!
        \brief Removes the factory-set limits of the selected parameter - Applies to: acA1920-48gm

        Removes the factory-set limits of the selected parameter. Having removed the factory-set limits, you may set the parameter within extended limits. These are only defined by technical restrictions. Note: Inferior image quality may result.
    
        Visibility: Guru

        Selected by: ParameterSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=RemoveLimits" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& RemoveLimits;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Minimum allowed frame acquisition period - Applies to: acA1920-48gm

        Minimum allowed frame acquisition period (in microseconds) given the current settings for the area of interest, exposure time, and bandwidth.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ResultingFramePeriodAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ResultingFramePeriodAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Maximum allowed frame acquisition rate - Applies to: acA1920-48gm

        Maximum allowed frame acquisition rate given the current camera settings (in frames per second).
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ResultingFrameRateAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ResultingFrameRateAbs;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Enables horizontal flipping of the image - Applies to: acA1920-48gm

        Enables horizontal flipping of the image. The AOI is applied after the flipping.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ReverseX" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ReverseX;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Enables vertical flipping of the image - Applies to: acA1920-48gm

        Enables vertical flipping of the image. The AOI is applied after the flipping.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ReverseY" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& ReverseY;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Horizontal scaling factor - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ScalingHorizontalAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ScalingHorizontalAbs;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Vertical scaling factor - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ScalingVerticalAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& ScalingVerticalAbs;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Height of the device's sensor in pixels - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SensorHeight" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SensorHeight;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the sensor readout mode - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SensorReadoutMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SensorReadoutModeEnums>& SensorReadoutMode;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Width of the device's sensor in pixels - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SensorWidth" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SensorWidth;

    //@}


    //! \name Categories: SequenceControlConfiguration
    //@{
    /*!
        \brief Sets which bit of the sequence set address can be controlled - Applies to: acA1920-48gm

        Sets which bit of the sequence set address can be controlled. Once a bit has been set, an input line can be set as the control source for this bit using the SequenceAddressBitSource parameter.
    
        Visibility: Guru

        Selecting Parameters: SequenceAddressBitSource

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceAddressBitSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceAddressBitSelectorEnums>& SequenceAddressBitSelector;

    //@}


    //! \name Categories: SequenceControlConfiguration
    //@{
    /*!
        \brief Sets an input line as the control source for the currently selected sequence set address bit - Applies to: acA1920-48gm

        Sets an input line as the control source for the currently selected sequence set address bit. The bit can be selected using the SequenceAddressBitSelector.
    
        Visibility: Guru

        Selected by: SequenceAddressBitSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceAddressBitSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceAddressBitSourceEnums>& SequenceAddressBitSource;

    //@}


    //! \name Categories: SequenceControlConfiguration
    //@{
    /*!
        \brief Sets the sequence set advance mode - Applies to: acA1920-48gm

    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceAdvanceMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceAdvanceModeEnums>& SequenceAdvanceMode;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Allows asynchronous advance from one sequence set to the next one - Applies to: acA1920-48gm

        Allows to advance from the current sequence set to the next one. The advance is asynchronous to the camera's frame trigger. Only available in Controlled sequence advance mode.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceAsyncAdvance" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& SequenceAsyncAdvance;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Allows asynchronous restart of the sequence of sequence sets - Applies to: acA1920-48gm

        Allows to restart the sequence of sequence sets, starting with the sequence set that has the lowest index number. The restart is asynchronous to the camera's frame trigger. Only available in Auto and Controlled sequence advance mode.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceAsyncRestart" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& SequenceAsyncRestart;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Sets whether the sequencer can be configured - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceConfigurationMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceConfigurationModeEnums>& SequenceConfigurationMode;

    //@}


    //! \name Categories: SequenceControlConfiguration
    //@{
    /*!
        \brief Sets whether the sequence control source should be set for sequence advance or for sequence restart - Applies to: acA1920-48gm

        Sets whether the sequence control source should be set for sequence advance or for sequence restart. Once this value has been set, a control source must be chosen using the SequenceControlSource parameter.
    
        Visibility: Guru

        Selecting Parameters: SequenceControlSource

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceControlSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceControlSelectorEnums>& SequenceControlSelector;

    //@}


    //! \name Categories: SequenceControlConfiguration
    //@{
    /*!
        \brief Sets the source for sequence control - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selected by: SequenceControlSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceControlSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SequenceControlSourceEnums>& SequenceControlSource;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Current sequence set - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceCurrentSet" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SequenceCurrentSet;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Enables the sequencer - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& SequenceEnable;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Number of sequence set executions - Applies to: acA1920-48gm

        Number of consecutive executions per sequence cycle for the selected sequence set. Only available in auto sequence advance mode.
    
        Visibility: Guru

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceSetExecutions" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SequenceSetExecutions;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Index number of a sequence set - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceSetIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SequenceSetIndex;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Loads a sequence set - Applies to: acA1920-48gm

        Loads an existing sequence set to make it the current sequence set.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceSetLoad" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& SequenceSetLoad;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Stores the current sequence set - Applies to: acA1920-48gm

        Stores the current sequence set. Storing the current sequence set will overwrite any already existing sequence set bearing the same index number. The sequence set is stored in the volatile memory and will therefore be lost if the camera is reset or if power is switched off.
    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceSetStore" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& SequenceSetStore;

    //@}


    //! \name Categories: SequenceControl
    //@{
    /*!
        \brief Total number of sequence sets in the sequence - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SequenceSetTotalNumber" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SequenceSetTotalNumber;

    //@}


    //! \name Categories: PGIControl
    //@{
    /*!
        \brief Amount of sharpening to apply - Applies to: acA1920-48gm

        Amount of sharpening to apply. The higher the sharpness, the more distinct the image subject's contours will be. However, too high values may result in image information loss. To enable this feature, the DemosaicingMode parameter must be set to BaslerPGI.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SharpnessEnhancementAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& SharpnessEnhancementAbs;

    //@}


    //! \name Categories: PGIControl
    //@{
    /*!
        \brief Amount of sharpening to apply - Applies to: acA1920-48gm

        Amount of sharpening to apply. The higher the sharpness, the more distinct the image subject's contours will be. However, too high values may result in image information loss. To enable this feature, the DemosaicingMode parameter must be set to BaslerPGI.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SharpnessEnhancementRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SharpnessEnhancementRaw;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the shutter mode - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=ShutterMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<ShutterModeEnums>& ShutterMode;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Enables the synchronous free run mode - Applies to: acA1920-48gm

        Enables the synchronous free run mode. When enabled, the camera will generate all required frame start or line start trigger signals internally, and you do not need to apply frame start or line start trigger signals to the camera.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncFreeRunTimerEnable" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& SyncFreeRunTimerEnable;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief High 32 bits of the synchronous free run trigger start time - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncFreeRunTimerStartTimeHigh" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SyncFreeRunTimerStartTimeHigh;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Low 32 bits of the synchronous free run trigger start time - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncFreeRunTimerStartTimeLow" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SyncFreeRunTimerStartTimeLow;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Synchronous free run trigger rate - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncFreeRunTimerTriggerRateAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& SyncFreeRunTimerTriggerRateAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Activates changed settings for the synchronous free run - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncFreeRunTimerUpdate" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& SyncFreeRunTimerUpdate;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Sets the user settable synchronous output signal to be configured - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selecting Parameters: SyncUserOutputValue

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncUserOutputSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<SyncUserOutputSelectorEnums>& SyncUserOutputSelector;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Enables the selected user settable synchronous output line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: SyncUserOutputSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncUserOutputValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& SyncUserOutputValue;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief A single bit field that sets the state of all user settable synchronous output signals in one access - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=SyncUserOutputValueAll" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& SyncUserOutputValueAll;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Temperature of the selected location within the device (in degrees centigrade) - Applies to: acA1920-48gm

        Temperature of the selected location within the device (in degrees centigrade). The temperature is measured at the location set by TemperatureSelector.
    
        Visibility: Expert

        Selected by: TemperatureSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TemperatureAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& TemperatureAbs;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Sets the location within the device where the temperature will be measured - Applies to: acA1920-48gm

    
        Visibility: Expert

        Selecting Parameters: TemperatureAbs

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TemperatureSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TemperatureSelectorEnums>& TemperatureSelector;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Returns the temperature state - Applies to: acA1920-48gm

    
        Visibility: Expert

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TemperatureState" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TemperatureStateEnums>& TemperatureState;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Holds all moving test images at their starting position - Applies to: acA1920-48gm

        Holds all moving test images at their starting position. All test images will be displayed at their starting positions and will stay fixed.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TestImageResetAndHold" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& TestImageResetAndHold;

    //@}


    //! \name Categories: ImageFormat
    //@{
    /*!
        \brief Sets the test image to display - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TestImageSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TestImageSelectorEnums>& TestImageSelector;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Delay of the currently selected timer in microseconds - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerDelayAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& TimerDelayAbs;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Raw delay for the selected timer - Applies to: acA1920-48gm

        Raw delay for the selected timer. This value sets an integer that will be used as a multiplier for the timer delay timebase. The actual delay time equals the current TimerDelayRaw setting multiplied with the current TimerDelayTimeBaseAbs setting.
    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerDelayRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& TimerDelayRaw;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Duration of the currently selected timer in microseconds - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerDurationAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& TimerDurationAbs;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Raw duration for the selected timer - Applies to: acA1920-48gm

        Raw duration for the selected timer. This value sets an integer that will be used as a multiplier for the timer duration timebase. The actual duration time equals the current TimerDurationRaw setting multiplied with the current TimerDurationTimeBaseAbs setting.
    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerDurationRaw" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& TimerDurationRaw;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the timer to be configured - Applies to: acA1920-48gm

        Sets the timer to be configured. Once a timer has been set, all changes to the timer settings will be applied to the selected timer.
    
        Visibility: Beginner

        Selecting Parameters: TimerDurationAbs, TimerDurationRaw, TimerDelayAbs, TimerDelayRaw, TimerTriggerSource and TimerTriggerActivation

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TimerSelectorEnums>& TimerSelector;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the type of signal transition that will start the timer - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerTriggerActivation" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TimerTriggerActivationEnums>& TimerTriggerActivation;

    //@}


    //! \name Categories: TimerControls
    //@{
    /*!
        \brief Sets the internal camera signal used to trigger the selected timer - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TimerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TimerTriggerSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TimerTriggerSourceEnums>& TimerTriggerSource;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the signal transition that activates the selected trigger - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TriggerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerActivation" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TriggerActivationEnums>& TriggerActivation;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Trigger delay time in microseconds - Applies to: acA1920-48gm

        Trigger delay time in microseconds. The delay is applied after the trigger reception and before effectively activating the trigger.
    
        Visibility: Expert

        Selected by: TriggerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerDelayAbs" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IFloatEx& TriggerDelayAbs;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the mode for the currently selected trigger - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TriggerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerMode" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TriggerModeEnums>& TriggerMode;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the trigger type to be configured - Applies to: acA1920-48gm

        Sets the trigger type to be configured. Once a trigger type has been set, all changes to the trigger settings will be applied to the selected trigger.
    
        Visibility: Beginner

        Selecting Parameters: TriggerMode, TriggerSoftware, TriggerSource, TriggerActivation and TriggerDelayAbs

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TriggerSelectorEnums>& TriggerSelector;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Generates a software trigger signal - Applies to: acA1920-48gm

        Generates a software trigger signal. The software trigger signal will be used if the TriggerSource parameter is set to Software.
    
        Visibility: Beginner

        Selected by: TriggerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerSoftware" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& TriggerSoftware;

    //@}


    //! \name Categories: AcquisitionTrigger
    //@{
    /*!
        \brief Sets the signal source for the selected trigger - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: TriggerSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=TriggerSource" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<TriggerSourceEnums>& TriggerSource;

    //@}


    //! \name Categories: UserDefinedValues
    //@{
    /*!
        \brief A user defined value - Applies to: acA1920-48gm

        A user defined value. The value can serve as storage location for the camera user. It has no impact on the operation of the camera.
    
        Visibility: Guru

        Selected by: UserDefinedValueSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserDefinedValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& UserDefinedValue;

    //@}


    //! \name Categories: UserDefinedValues
    //@{
    /*!
        \brief Sets the user-defined value to set or read - Applies to: acA1920-48gm

    
        Visibility: Guru

        Selecting Parameters: UserDefinedValue

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserDefinedValueSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<UserDefinedValueSelectorEnums>& UserDefinedValueSelector;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Sets the user settable output signal to be configured - Applies to: acA1920-48gm

        Sets the user settable output signal to be configured. Once a user settable output signal has been set, all changes to the user settable output signal settings will be applied to the selected user settable output signal.
    
        Visibility: Beginner

        Selecting Parameters: UserOutputValue

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserOutputSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<UserOutputSelectorEnums>& UserOutputSelector;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief Enables the selected user settable output line - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: UserOutputSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserOutputValue" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IBooleanEx& UserOutputValue;

    //@}


    //! \name Categories: DigitalIO
    //@{
    /*!
        \brief A single bit field that sets the state of all user settable output signals in one access - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserOutputValueAll" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& UserOutputValueAll;

    //@}


    //! \name Categories: UserSets
    //@{
    /*!
        \brief Sets the user set or the factory set to be used as the startup set - Applies to: acA1920-48gm

        Sets the user set or the factory set to be used as the startup set. The default startup set will be loaded as the active set whenever the camera is powered on or reset.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserSetDefaultSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<UserSetDefaultSelectorEnums>& UserSetDefaultSelector;

    //@}


    //! \name Categories: UserSets
    //@{
    /*!
        \brief Loads the selected set into the camera's volatile memory and makes it the active configuration set - Applies to: acA1920-48gm

        Loads the selected set into the camera's volatile memory and makes it the active configuration set. Once the selected set is loaded, the parameters in the selected set will control the camera.
    
        Visibility: Beginner

        Selected by: UserSetSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserSetLoad" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& UserSetLoad;

    //@}


    //! \name Categories: UserSets
    //@{
    /*!
        \brief Saves the current active set into the selected user set - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selected by: UserSetSelector

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserSetSave" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::ICommandEx& UserSetSave;

    //@}


    //! \name Categories: UserSets
    //@{
    /*!
        \brief Sets the user set or the factory set to load, save or configure - Applies to: acA1920-48gm

    
        Visibility: Beginner

        Selecting Parameters: UserSetLoad and UserSetSave

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=UserSetSelector" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IEnumParameterT<UserSetSelectorEnums>& UserSetSelector;

    //@}


    //! \name Categories: VirtualLine1RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the virtual line 1 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine1RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine1RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: VirtualLine1RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the virtual line 1 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine1RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine1RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: VirtualLine2RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the virtual line 2 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine2RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine2RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: VirtualLine2RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the virtual line 2 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine2RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine2RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: VirtualLine3RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the virtual line 3 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine3RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine3RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: VirtualLine3RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the virtual line 3 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine3RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine3RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: VirtualLine4RisingEdgeEventData
    //@{
    /*!
        \brief Stream channel index of the virtual line 4 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine4RisingEdgeEventStreamChannelIndex" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine4RisingEdgeEventStreamChannelIndex;

    //@}


    //! \name Categories: VirtualLine4RisingEdgeEventData
    //@{
    /*!
        \brief Time stamp of the virtual line 4 rising edge event - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=VirtualLine4RisingEdgeEventTimestamp" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& VirtualLine4RisingEdgeEventTimestamp;

    //@}


    //! \name Categories: AOI
    //@{
    /*!
        \brief Width of the area of interest in pixels - Applies to: acA1920-48gm

    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=Width" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& Width;

    //@}


    //! \name Categories: DeviceInformation
    //@{
    /*!
        \brief Maximum allowed width of the image in pixels - Applies to: acA1920-48gm

        Maximum allowed width of the image in pixels, taking into account any function that may limit the allowed width.
    
        Visibility: Beginner

        The <a href="https://docs.baslerweb.com/?rhcsh=1&rhmapid=WidthMax" target="_blank">Basler Product Documentation</a> may provide more information.
    */
    Pylon::IIntegerEx& WidthMax;

    //@}


        private:
        //! \cond HIDE_CLASS_METHODS

            //! not implemented copy constructor
            BaslerCameraCameraParams(BaslerCameraCameraParams&);

            //! not implemented assignment operator
            BaslerCameraCameraParams& operator=(BaslerCameraCameraParams&);

        //! \endcond
    };

} // namespace Pylon
} // namespace BaslerCameraCameraParams_Params

#ifdef _MSC_VER
#pragma warning( pop )
#endif

#endif // BASLER_PYLON_BASLERCAMERACAMERAPARAMS_H