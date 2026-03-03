//-----------------------------------------------------------------------------
//  Basler pylon SDK
//  Copyright (c) 2023-2025 Basler AG
//  http://www.baslerweb.com
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//  This file is generated automatically
//  Do not modify!
//-----------------------------------------------------------------------------

// common parameter types
#if defined(PYLON_GENERATED_PARAMETER_CLASSES_USE_STDAFX)
#include "stdafx.h"
#endif
#include "BaslerCameraCameraParams.h"

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
    // Enumeration support classes
    //**************************************************************************************************
    //! \cond HIDE_CLASS_METHODS

    ///////////////////////////////////////////////////////////////////////////
    //
    namespace EnumParameterClasses
    {
        ///////////////////////////////////////////////////////////////////////////
        //
        class AcquisitionModeEnumParameter : public Pylon::CEnumParameterT<AcquisitionModeEnums>
        {
        public:
            AcquisitionModeEnumParameter()
            {
            }

            virtual ~AcquisitionModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Continuous", 11),
                    TableItem_t("SingleFrame", 12)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class AcquisitionStatusSelectorEnumParameter : public Pylon::CEnumParameterT<AcquisitionStatusSelectorEnums>
        {
        public:
            AcquisitionStatusSelectorEnumParameter()
            {
            }

            virtual ~AcquisitionStatusSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 8;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AcquisitionActive", 18),
                    TableItem_t("AcquisitionTransfer", 20),
                    TableItem_t("AcquisitionTriggerWait", 23),
                    TableItem_t("ExposureActive", 15),
                    TableItem_t("FrameActive", 12),
                    TableItem_t("FrameTransfer", 14),
                    TableItem_t("FrameTriggerWait", 17),
                    TableItem_t("LineTriggerWait", 16)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class AutoFunctionAOISelectorEnumParameter : public Pylon::CEnumParameterT<AutoFunctionAOISelectorEnums>
        {
        public:
            AutoFunctionAOISelectorEnumParameter()
            {
            }

            virtual ~AutoFunctionAOISelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AOI1", 5),
                    TableItem_t("AOI2", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class AutoFunctionProfileEnumParameter : public Pylon::CEnumParameterT<AutoFunctionProfileEnums>
        {
        public:
            AutoFunctionProfileEnumParameter()
            {
            }

            virtual ~AutoFunctionProfileEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("ExposureMinimum", 16),
                    TableItem_t("GainMinimum", 12)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class BalanceRatioSelectorEnumParameter : public Pylon::CEnumParameterT<BalanceRatioSelectorEnums>
        {
        public:
            BalanceRatioSelectorEnumParameter()
            {
            }

            virtual ~BalanceRatioSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class BalanceWhiteAutoEnumParameter : public Pylon::CEnumParameterT<BalanceWhiteAutoEnums>
        {
        public:
            BalanceWhiteAutoEnumParameter()
            {
            }

            virtual ~BalanceWhiteAutoEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class BinningHorizontalModeEnumParameter : public Pylon::CEnumParameterT<BinningHorizontalModeEnums>
        {
        public:
            BinningHorizontalModeEnumParameter()
            {
            }

            virtual ~BinningHorizontalModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Average", 8),
                    TableItem_t("Sum", 4)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class BinningVerticalModeEnumParameter : public Pylon::CEnumParameterT<BinningVerticalModeEnums>
        {
        public:
            BinningVerticalModeEnumParameter()
            {
            }

            virtual ~BinningVerticalModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Average", 8),
                    TableItem_t("Sum", 4)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class BlackLevelSelectorEnumParameter : public Pylon::CEnumParameterT<BlackLevelSelectorEnums>
        {
        public:
            BlackLevelSelectorEnumParameter()
            {
            }

            virtual ~BlackLevelSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("All", 4)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ChunkSelectorEnumParameter : public Pylon::CEnumParameterT<ChunkSelectorEnums>
        {
        public:
            ChunkSelectorEnumParameter()
            {
            }

            virtual ~ChunkSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ColorAdjustmentSelectorEnumParameter : public Pylon::CEnumParameterT<ColorAdjustmentSelectorEnums>
        {
        public:
            ColorAdjustmentSelectorEnumParameter()
            {
            }

            virtual ~ColorAdjustmentSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ColorTransformationSelectorEnumParameter : public Pylon::CEnumParameterT<ColorTransformationSelectorEnums>
        {
        public:
            ColorTransformationSelectorEnumParameter()
            {
            }

            virtual ~ColorTransformationSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ColorTransformationValueSelectorEnumParameter : public Pylon::CEnumParameterT<ColorTransformationValueSelectorEnums>
        {
        public:
            ColorTransformationValueSelectorEnumParameter()
            {
            }

            virtual ~ColorTransformationValueSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class CounterEventSourceEnumParameter : public Pylon::CEnumParameterT<CounterEventSourceEnums>
        {
        public:
            CounterEventSourceEnumParameter()
            {
            }

            virtual ~CounterEventSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("FrameTrigger", 13)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class CounterResetSourceEnumParameter : public Pylon::CEnumParameterT<CounterResetSourceEnums>
        {
        public:
            CounterResetSourceEnumParameter()
            {
            }

            virtual ~CounterResetSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 4;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Line1", 6),
                    TableItem_t("Line3", 6),
                    TableItem_t("Off", 4),
                    TableItem_t("Software", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class CounterSelectorEnumParameter : public Pylon::CEnumParameterT<CounterSelectorEnums>
        {
        public:
            CounterSelectorEnumParameter()
            {
            }

            virtual ~CounterSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Counter1", 9),
                    TableItem_t("Counter2", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class DemosaicingModeEnumParameter : public Pylon::CEnumParameterT<DemosaicingModeEnums>
        {
        public:
            DemosaicingModeEnumParameter()
            {
            }

            virtual ~DemosaicingModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class DeviceScanTypeEnumParameter : public Pylon::CEnumParameterT<DeviceScanTypeEnums>
        {
        public:
            DeviceScanTypeEnumParameter()
            {
            }

            virtual ~DeviceScanTypeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Areascan", 9),
                    TableItem_t("Linescan", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class EventNotificationEnumParameter : public Pylon::CEnumParameterT<EventNotificationEnums>
        {
        public:
            EventNotificationEnumParameter()
            {
            }

            virtual ~EventNotificationEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("GenICamEvent", 13),
                    TableItem_t("Off", 4),
                    TableItem_t("On", 3)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class EventSelectorEnumParameter : public Pylon::CEnumParameterT<EventSelectorEnums>
        {
        public:
            EventSelectorEnumParameter()
            {
            }

            virtual ~EventSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 11;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AcquisitionStart", 17),
                    TableItem_t("AcquisitionStartOvertrigger", 28),
                    TableItem_t("AcquisitionStartWait", 21),
                    TableItem_t("ActionLate", 11),
                    TableItem_t("CriticalTemperature", 20),
                    TableItem_t("EventOverrun", 13),
                    TableItem_t("ExposureEnd", 12),
                    TableItem_t("FrameStart", 11),
                    TableItem_t("FrameStartOvertrigger", 22),
                    TableItem_t("FrameStartWait", 15),
                    TableItem_t("OverTemperature", 16)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ExpertFeatureAccessSelectorEnumParameter : public Pylon::CEnumParameterT<ExpertFeatureAccessSelectorEnums>
        {
        public:
            ExpertFeatureAccessSelectorEnumParameter()
            {
            }

            virtual ~ExpertFeatureAccessSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 10;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("ExpertFeature1", 15),
                    TableItem_t("ExpertFeature1_Legacy", 22),
                    TableItem_t("ExpertFeature2", 15),
                    TableItem_t("ExpertFeature3", 15),
                    TableItem_t("ExpertFeature4", 15),
                    TableItem_t("ExpertFeature5", 15),
                    TableItem_t("ExpertFeature6", 15),
                    TableItem_t("ExpertFeature7", 15),
                    TableItem_t("ExpertFeature8", 15),
                    TableItem_t("ExpertFeature9", 15)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ExposureAutoEnumParameter : public Pylon::CEnumParameterT<ExposureAutoEnums>
        {
        public:
            ExposureAutoEnumParameter()
            {
            }

            virtual ~ExposureAutoEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Continuous", 11),
                    TableItem_t("Off", 4),
                    TableItem_t("Once", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ExposureModeEnumParameter : public Pylon::CEnumParameterT<ExposureModeEnums>
        {
        public:
            ExposureModeEnumParameter()
            {
            }

            virtual ~ExposureModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Timed", 6)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ExposureOverlapTimeModeEnumParameter : public Pylon::CEnumParameterT<ExposureOverlapTimeModeEnums>
        {
        public:
            ExposureOverlapTimeModeEnumParameter()
            {
            }

            virtual ~ExposureOverlapTimeModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class FileOpenModeEnumParameter : public Pylon::CEnumParameterT<FileOpenModeEnums>
        {
        public:
            FileOpenModeEnumParameter()
            {
            }

            virtual ~FileOpenModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Read", 5),
                    TableItem_t("Write", 6)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class FileOperationSelectorEnumParameter : public Pylon::CEnumParameterT<FileOperationSelectorEnums>
        {
        public:
            FileOperationSelectorEnumParameter()
            {
            }

            virtual ~FileOperationSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 4;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Close", 6),
                    TableItem_t("Open", 5),
                    TableItem_t("Read", 5),
                    TableItem_t("Write", 6)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class FileOperationStatusEnumParameter : public Pylon::CEnumParameterT<FileOperationStatusEnums>
        {
        public:
            FileOperationStatusEnumParameter()
            {
            }

            virtual ~FileOperationStatusEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Failure", 8),
                    TableItem_t("Success", 8)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class FileSelectorEnumParameter : public Pylon::CEnumParameterT<FileSelectorEnums>
        {
        public:
            FileSelectorEnumParameter()
            {
            }

            virtual ~FileSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 9;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("ExpertFeature7File", 19),
                    TableItem_t("UserData", 9),
                    TableItem_t("UserGainShading1", 17),
                    TableItem_t("UserGainShading2", 17),
                    TableItem_t("UserOffsetShading1", 19),
                    TableItem_t("UserOffsetShading2", 19),
                    TableItem_t("UserSet1", 9),
                    TableItem_t("UserSet2", 9),
                    TableItem_t("UserSet3", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GainAutoEnumParameter : public Pylon::CEnumParameterT<GainAutoEnums>
        {
        public:
            GainAutoEnumParameter()
            {
            }

            virtual ~GainAutoEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Continuous", 11),
                    TableItem_t("Off", 4),
                    TableItem_t("Once", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GainSelectorEnumParameter : public Pylon::CEnumParameterT<GainSelectorEnums>
        {
        public:
            GainSelectorEnumParameter()
            {
            }

            virtual ~GainSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("All", 4)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GammaSelectorEnumParameter : public Pylon::CEnumParameterT<GammaSelectorEnums>
        {
        public:
            GammaSelectorEnumParameter()
            {
            }

            virtual ~GammaSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("User", 5),
                    TableItem_t("sRGB", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GevCCPEnumParameter : public Pylon::CEnumParameterT<GevCCPEnums>
        {
        public:
            GevCCPEnumParameter()
            {
            }

            virtual ~GevCCPEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Control", 8),
                    TableItem_t("Exclusive", 10),
                    TableItem_t("ExclusiveControl", 17)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GevIEEE1588StatusEnumParameter : public Pylon::CEnumParameterT<GevIEEE1588StatusEnums>
        {
        public:
            GevIEEE1588StatusEnumParameter()
            {
            }

            virtual ~GevIEEE1588StatusEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GevIEEE1588StatusLatchedEnumParameter : public Pylon::CEnumParameterT<GevIEEE1588StatusLatchedEnums>
        {
        public:
            GevIEEE1588StatusLatchedEnumParameter()
            {
            }

            virtual ~GevIEEE1588StatusLatchedEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GevInterfaceSelectorEnumParameter : public Pylon::CEnumParameterT<GevInterfaceSelectorEnums>
        {
        public:
            GevInterfaceSelectorEnumParameter()
            {
            }

            virtual ~GevInterfaceSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("NetworkInterface0", 18)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class GevStreamChannelSelectorEnumParameter : public Pylon::CEnumParameterT<GevStreamChannelSelectorEnums>
        {
        public:
            GevStreamChannelSelectorEnumParameter()
            {
            }

            virtual ~GevStreamChannelSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("StreamChannel0", 15)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LUTSelectorEnumParameter : public Pylon::CEnumParameterT<LUTSelectorEnums>
        {
        public:
            LUTSelectorEnumParameter()
            {
            }

            virtual ~LUTSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Luminance", 10)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LastErrorEnumParameter : public Pylon::CEnumParameterT<LastErrorEnums>
        {
        public:
            LastErrorEnumParameter()
            {
            }

            virtual ~LastErrorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 8;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("InsufficientTriggerWidth", 25),
                    TableItem_t("InvalidParameter", 17),
                    TableItem_t("NoError", 8),
                    TableItem_t("OverTemperature", 16),
                    TableItem_t("Overtrigger", 12),
                    TableItem_t("PowerFailure", 13),
                    TableItem_t("UserDefPixFailure", 18),
                    TableItem_t("Userset", 8)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LightSourceSelectorEnumParameter : public Pylon::CEnumParameterT<LightSourceSelectorEnums>
        {
        public:
            LightSourceSelectorEnumParameter()
            {
            }

            virtual ~LightSourceSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LineFormatEnumParameter : public Pylon::CEnumParameterT<LineFormatEnums>
        {
        public:
            LineFormatEnumParameter()
            {
            }

            virtual ~LineFormatEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 6;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("LVDS", 5),
                    TableItem_t("NoConnect", 10),
                    TableItem_t("OptoCoupled", 12),
                    TableItem_t("RS422", 6),
                    TableItem_t("TTL", 4),
                    TableItem_t("TriState", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LineLogicEnumParameter : public Pylon::CEnumParameterT<LineLogicEnums>
        {
        public:
            LineLogicEnumParameter()
            {
            }

            virtual ~LineLogicEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Negative", 9),
                    TableItem_t("Positive", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LineModeEnumParameter : public Pylon::CEnumParameterT<LineModeEnums>
        {
        public:
            LineModeEnumParameter()
            {
            }

            virtual ~LineModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Input", 6),
                    TableItem_t("Output", 7)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LineSelectorEnumParameter : public Pylon::CEnumParameterT<LineSelectorEnums>
        {
        public:
            LineSelectorEnumParameter()
            {
            }

            virtual ~LineSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Line1", 6),
                    TableItem_t("Line2", 6),
                    TableItem_t("Line3", 6)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class LineSourceEnumParameter : public Pylon::CEnumParameterT<LineSourceEnums>
        {
        public:
            LineSourceEnumParameter()
            {
            }

            virtual ~LineSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ParameterSelectorEnumParameter : public Pylon::CEnumParameterT<ParameterSelectorEnums>
        {
        public:
            ParameterSelectorEnumParameter()
            {
            }

            virtual ~ParameterSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AutoTargetValue", 16),
                    TableItem_t("ExposureTime", 13),
                    TableItem_t("Gain", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class PixelColorFilterEnumParameter : public Pylon::CEnumParameterT<PixelColorFilterEnums>
        {
        public:
            PixelColorFilterEnumParameter()
            {
            }

            virtual ~PixelColorFilterEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 5;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Bayer_BG", 9),
                    TableItem_t("Bayer_GB", 9),
                    TableItem_t("Bayer_GR", 9),
                    TableItem_t("Bayer_RG", 9),
                    TableItem_t("None", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class PixelFormatEnumParameter : public Pylon::CEnumParameterT<PixelFormatEnums>
        {
        public:
            PixelFormatEnumParameter()
            {
            }

            virtual ~PixelFormatEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Mono10", 7),
                    TableItem_t("Mono10p", 8),
                    TableItem_t("Mono8", 6)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class PixelSizeEnumParameter : public Pylon::CEnumParameterT<PixelSizeEnums>
        {
        public:
            PixelSizeEnumParameter()
            {
            }

            virtual ~PixelSizeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 11;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Bpp1", 5),
                    TableItem_t("Bpp10", 6),
                    TableItem_t("Bpp12", 6),
                    TableItem_t("Bpp16", 6),
                    TableItem_t("Bpp2", 5),
                    TableItem_t("Bpp24", 6),
                    TableItem_t("Bpp32", 6),
                    TableItem_t("Bpp36", 6),
                    TableItem_t("Bpp4", 5),
                    TableItem_t("Bpp48", 6),
                    TableItem_t("Bpp8", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SensorReadoutModeEnumParameter : public Pylon::CEnumParameterT<SensorReadoutModeEnums>
        {
        public:
            SensorReadoutModeEnumParameter()
            {
            }

            virtual ~SensorReadoutModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Fast", 5),
                    TableItem_t("Normal", 7)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceAddressBitSelectorEnumParameter : public Pylon::CEnumParameterT<SequenceAddressBitSelectorEnums>
        {
        public:
            SequenceAddressBitSelectorEnumParameter()
            {
            }

            virtual ~SequenceAddressBitSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceAddressBitSourceEnumParameter : public Pylon::CEnumParameterT<SequenceAddressBitSourceEnums>
        {
        public:
            SequenceAddressBitSourceEnumParameter()
            {
            }

            virtual ~SequenceAddressBitSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceAdvanceModeEnumParameter : public Pylon::CEnumParameterT<SequenceAdvanceModeEnums>
        {
        public:
            SequenceAdvanceModeEnumParameter()
            {
            }

            virtual ~SequenceAdvanceModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Auto", 5),
                    TableItem_t("Controlled", 11),
                    TableItem_t("FreeSelection", 14)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceConfigurationModeEnumParameter : public Pylon::CEnumParameterT<SequenceConfigurationModeEnums>
        {
        public:
            SequenceConfigurationModeEnumParameter()
            {
            }

            virtual ~SequenceConfigurationModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Off", 4),
                    TableItem_t("On", 3)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceControlSelectorEnumParameter : public Pylon::CEnumParameterT<SequenceControlSelectorEnums>
        {
        public:
            SequenceControlSelectorEnumParameter()
            {
            }

            virtual ~SequenceControlSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SequenceControlSourceEnumParameter : public Pylon::CEnumParameterT<SequenceControlSourceEnums>
        {
        public:
            SequenceControlSourceEnumParameter()
            {
            }

            virtual ~SequenceControlSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Todo", 5)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class ShutterModeEnumParameter : public Pylon::CEnumParameterT<ShutterModeEnums>
        {
        public:
            ShutterModeEnumParameter()
            {
            }

            virtual ~ShutterModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Global", 7)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class SyncUserOutputSelectorEnumParameter : public Pylon::CEnumParameterT<SyncUserOutputSelectorEnums>
        {
        public:
            SyncUserOutputSelectorEnumParameter()
            {
            }

            virtual ~SyncUserOutputSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("SyncUserOutput1", 16),
                    TableItem_t("SyncUserOutput2", 16)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TemperatureSelectorEnumParameter : public Pylon::CEnumParameterT<TemperatureSelectorEnums>
        {
        public:
            TemperatureSelectorEnumParameter()
            {
            }

            virtual ~TemperatureSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Coreboard", 10)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TemperatureStateEnumParameter : public Pylon::CEnumParameterT<TemperatureStateEnums>
        {
        public:
            TemperatureStateEnumParameter()
            {
            }

            virtual ~TemperatureStateEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 3;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Critical", 9),
                    TableItem_t("Error", 6),
                    TableItem_t("Ok", 3)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TestImageSelectorEnumParameter : public Pylon::CEnumParameterT<TestImageSelectorEnums>
        {
        public:
            TestImageSelectorEnumParameter()
            {
            }

            virtual ~TestImageSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 6;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Off", 4),
                    TableItem_t("Testimage1", 11),
                    TableItem_t("Testimage2", 11),
                    TableItem_t("Testimage3", 11),
                    TableItem_t("Testimage4", 11),
                    TableItem_t("Testimage5", 11)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TimerSelectorEnumParameter : public Pylon::CEnumParameterT<TimerSelectorEnums>
        {
        public:
            TimerSelectorEnumParameter()
            {
            }

            virtual ~TimerSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Timer1", 7)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TimerTriggerActivationEnumParameter : public Pylon::CEnumParameterT<TimerTriggerActivationEnums>
        {
        public:
            TimerTriggerActivationEnumParameter()
            {
            }

            virtual ~TimerTriggerActivationEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("RisingEdge", 11)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TimerTriggerSourceEnumParameter : public Pylon::CEnumParameterT<TimerTriggerSourceEnums>
        {
        public:
            TimerTriggerSourceEnumParameter()
            {
            }

            virtual ~TimerTriggerSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 1;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("ExposureStart", 14)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TriggerActivationEnumParameter : public Pylon::CEnumParameterT<TriggerActivationEnums>
        {
        public:
            TriggerActivationEnumParameter()
            {
            }

            virtual ~TriggerActivationEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("FallingEdge", 12),
                    TableItem_t("RisingEdge", 11)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TriggerModeEnumParameter : public Pylon::CEnumParameterT<TriggerModeEnums>
        {
        public:
            TriggerModeEnumParameter()
            {
            }

            virtual ~TriggerModeEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Off", 4),
                    TableItem_t("On", 3)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TriggerSelectorEnumParameter : public Pylon::CEnumParameterT<TriggerSelectorEnums>
        {
        public:
            TriggerSelectorEnumParameter()
            {
            }

            virtual ~TriggerSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AcquisitionStart", 17),
                    TableItem_t("FrameStart", 11)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class TriggerSourceEnumParameter : public Pylon::CEnumParameterT<TriggerSourceEnums>
        {
        public:
            TriggerSourceEnumParameter()
            {
            }

            virtual ~TriggerSourceEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 4;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Action1", 8),
                    TableItem_t("Line1", 6),
                    TableItem_t("Line3", 6),
                    TableItem_t("Software", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class UserDefinedValueSelectorEnumParameter : public Pylon::CEnumParameterT<UserDefinedValueSelectorEnums>
        {
        public:
            UserDefinedValueSelectorEnumParameter()
            {
            }

            virtual ~UserDefinedValueSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 5;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("Value1", 7),
                    TableItem_t("Value2", 7),
                    TableItem_t("Value3", 7),
                    TableItem_t("Value4", 7),
                    TableItem_t("Value5", 7)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class UserOutputSelectorEnumParameter : public Pylon::CEnumParameterT<UserOutputSelectorEnums>
        {
        public:
            UserOutputSelectorEnumParameter()
            {
            }

            virtual ~UserOutputSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 2;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("UserOutput1", 12),
                    TableItem_t("UserOutput2", 12)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class UserSetDefaultSelectorEnumParameter : public Pylon::CEnumParameterT<UserSetDefaultSelectorEnums>
        {
        public:
            UserSetDefaultSelectorEnumParameter()
            {
            }

            virtual ~UserSetDefaultSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 6;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AutoFunctions", 14),
                    TableItem_t("Default", 8),
                    TableItem_t("HighGain", 9),
                    TableItem_t("UserSet1", 9),
                    TableItem_t("UserSet2", 9),
                    TableItem_t("UserSet3", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


        ///////////////////////////////////////////////////////////////////////////
        //
        class UserSetSelectorEnumParameter : public Pylon::CEnumParameterT<UserSetSelectorEnums>
        {
        public:
            UserSetSelectorEnumParameter()
            {
            }

            virtual ~UserSetSelectorEnumParameter()
            {
            }
        protected:
            virtual const Table_t& GetTable() const
            {
                static const size_t cItemCount = 6;
                static const TableItem_t cItems[cItemCount] =
                {
                    TableItem_t("AutoFunctions", 14),
                    TableItem_t("Default", 8),
                    TableItem_t("HighGain", 9),
                    TableItem_t("UserSet1", 9),
                    TableItem_t("UserSet2", 9),
                    TableItem_t("UserSet3", 9)
                };
                static const Table_t table(cItems, cItemCount);
                return table;
            }
        };


    }

    //! \endcond
    //**************************************************************************************************
    // Parameter class BaslerCameraCameraParams implementation
    //**************************************************************************************************

    //! \cond HIDE_CLASS_METHODS
    
    ///////////////////////////////////////////////////////////////////////////
    //
    class BaslerCameraCameraParams::BaslerCameraCameraParams_Data
    {
    public:
        Pylon::CIntegerParameter AcquisitionFrameCount;
        Pylon::CFloatParameter AcquisitionFrameRateAbs;
        Pylon::CBooleanParameter AcquisitionFrameRateEnable;
        EnumParameterClasses::AcquisitionModeEnumParameter AcquisitionMode;
        Pylon::CCommandParameter AcquisitionStart;
        Pylon::CIntegerParameter AcquisitionStartEventStreamChannelIndex;
        Pylon::CIntegerParameter AcquisitionStartEventTimestamp;
        Pylon::CIntegerParameter AcquisitionStartOvertriggerEventStreamChannelIndex;
        Pylon::CIntegerParameter AcquisitionStartOvertriggerEventTimestamp;
        Pylon::CIntegerParameter AcquisitionStartWaitEventStreamChannelIndex;
        Pylon::CIntegerParameter AcquisitionStartWaitEventTimestamp;
        Pylon::CBooleanParameter AcquisitionStatus;
        EnumParameterClasses::AcquisitionStatusSelectorEnumParameter AcquisitionStatusSelector;
        Pylon::CCommandParameter AcquisitionStop;
        Pylon::CIntegerParameter ActionDeviceKey;
        Pylon::CIntegerParameter ActionGroupKey;
        Pylon::CIntegerParameter ActionGroupMask;
        Pylon::CIntegerParameter ActionLateEventStreamChannelIndex;
        Pylon::CIntegerParameter ActionLateEventTimestamp;
        Pylon::CIntegerParameter ActionSelector;
        Pylon::CFloatParameter AutoExposureTimeAbsLowerLimit;
        Pylon::CFloatParameter AutoExposureTimeAbsUpperLimit;
        Pylon::CIntegerParameter AutoFunctionAOIHeight;
        Pylon::CIntegerParameter AutoFunctionAOIOffsetX;
        Pylon::CIntegerParameter AutoFunctionAOIOffsetY;
        EnumParameterClasses::AutoFunctionAOISelectorEnumParameter AutoFunctionAOISelector;
        Pylon::CBooleanParameter AutoFunctionAOIUsageIntensity;
        Pylon::CBooleanParameter AutoFunctionAOIUsageWhiteBalance;
        Pylon::CIntegerParameter AutoFunctionAOIWidth;
        EnumParameterClasses::AutoFunctionProfileEnumParameter AutoFunctionProfile;
        Pylon::CIntegerParameter AutoGainRawLowerLimit;
        Pylon::CIntegerParameter AutoGainRawUpperLimit;
        Pylon::CIntegerParameter AutoTargetValue;
        Pylon::CFloatParameter BalanceRatioAbs;
        Pylon::CIntegerParameter BalanceRatioRaw;
        EnumParameterClasses::BalanceRatioSelectorEnumParameter BalanceRatioSelector;
        Pylon::CFloatParameter BalanceWhiteAdjustmentDampingAbs;
        Pylon::CIntegerParameter BalanceWhiteAdjustmentDampingRaw;
        EnumParameterClasses::BalanceWhiteAutoEnumParameter BalanceWhiteAuto;
        Pylon::CCommandParameter BalanceWhiteReset;
        Pylon::CIntegerParameter BinningHorizontal;
        EnumParameterClasses::BinningHorizontalModeEnumParameter BinningHorizontalMode;
        Pylon::CIntegerParameter BinningVertical;
        EnumParameterClasses::BinningVerticalModeEnumParameter BinningVerticalMode;
        Pylon::CIntegerParameter BlackLevelRaw;
        EnumParameterClasses::BlackLevelSelectorEnumParameter BlackLevelSelector;
        Pylon::CBooleanParameter CenterX;
        Pylon::CBooleanParameter CenterY;
        Pylon::CBooleanParameter ChunkEnable;
        Pylon::CBooleanParameter ChunkModeActive;
        EnumParameterClasses::ChunkSelectorEnumParameter ChunkSelector;
        Pylon::CCommandParameter ClearLastError;
        Pylon::CBooleanParameter ColorAdjustmentEnable;
        Pylon::CFloatParameter ColorAdjustmentHue;
        Pylon::CIntegerParameter ColorAdjustmentHueRaw;
        Pylon::CCommandParameter ColorAdjustmentReset;
        Pylon::CFloatParameter ColorAdjustmentSaturation;
        Pylon::CIntegerParameter ColorAdjustmentSaturationRaw;
        EnumParameterClasses::ColorAdjustmentSelectorEnumParameter ColorAdjustmentSelector;
        Pylon::CFloatParameter ColorTransformationMatrixFactor;
        Pylon::CIntegerParameter ColorTransformationMatrixFactorRaw;
        EnumParameterClasses::ColorTransformationSelectorEnumParameter ColorTransformationSelector;
        Pylon::CFloatParameter ColorTransformationValue;
        Pylon::CIntegerParameter ColorTransformationValueRaw;
        EnumParameterClasses::ColorTransformationValueSelectorEnumParameter ColorTransformationValueSelector;
        EnumParameterClasses::CounterEventSourceEnumParameter CounterEventSource;
        Pylon::CCommandParameter CounterReset;
        EnumParameterClasses::CounterResetSourceEnumParameter CounterResetSource;
        EnumParameterClasses::CounterSelectorEnumParameter CounterSelector;
        Pylon::CBooleanParameter CriticalTemperature;
        Pylon::CIntegerParameter CriticalTemperatureEventStreamChannelIndex;
        Pylon::CIntegerParameter CriticalTemperatureEventTimestamp;
        Pylon::CIntegerParameter DecimationHorizontal;
        Pylon::CIntegerParameter DecimationVertical;
        EnumParameterClasses::DemosaicingModeEnumParameter DemosaicingMode;
        Pylon::CStringParameter DeviceFirmwareVersion;
        Pylon::CStringParameter DeviceID;
        Pylon::CStringParameter DeviceManufacturerInfo;
        Pylon::CStringParameter DeviceModelName;
        Pylon::CCommandParameter DeviceRegistersStreamingEnd;
        Pylon::CCommandParameter DeviceRegistersStreamingStart;
        Pylon::CCommandParameter DeviceReset;
        EnumParameterClasses::DeviceScanTypeEnumParameter DeviceScanType;
        Pylon::CStringParameter DeviceUserID;
        Pylon::CStringParameter DeviceVendorName;
        Pylon::CStringParameter DeviceVersion;
        Pylon::CIntegerParameter DigitalShift;
        Pylon::CBooleanParameter EnableBurstAcquisition;
        EnumParameterClasses::EventNotificationEnumParameter EventNotification;
        Pylon::CIntegerParameter EventOverrunEventFrameID;
        Pylon::CIntegerParameter EventOverrunEventStreamChannelIndex;
        Pylon::CIntegerParameter EventOverrunEventTimestamp;
        EnumParameterClasses::EventSelectorEnumParameter EventSelector;
        Pylon::CIntegerParameter ExpertFeatureAccessKey;
        EnumParameterClasses::ExpertFeatureAccessSelectorEnumParameter ExpertFeatureAccessSelector;
        Pylon::CBooleanParameter ExpertFeatureEnable;
        EnumParameterClasses::ExposureAutoEnumParameter ExposureAuto;
        Pylon::CIntegerParameter ExposureEndEventFrameID;
        Pylon::CIntegerParameter ExposureEndEventStreamChannelIndex;
        Pylon::CIntegerParameter ExposureEndEventTimestamp;
        EnumParameterClasses::ExposureModeEnumParameter ExposureMode;
        Pylon::CFloatParameter ExposureOverlapTimeMaxAbs;
        Pylon::CIntegerParameter ExposureOverlapTimeMaxRaw;
        EnumParameterClasses::ExposureOverlapTimeModeEnumParameter ExposureOverlapTimeMode;
        Pylon::CFloatParameter ExposureTimeAbs;
        Pylon::CIntegerParameter ExposureTimeRaw;
        Pylon::CArrayParameter FileAccessBuffer;
        Pylon::CIntegerParameter FileAccessLength;
        Pylon::CIntegerParameter FileAccessOffset;
        EnumParameterClasses::FileOpenModeEnumParameter FileOpenMode;
        Pylon::CCommandParameter FileOperationExecute;
        Pylon::CIntegerParameter FileOperationResult;
        EnumParameterClasses::FileOperationSelectorEnumParameter FileOperationSelector;
        EnumParameterClasses::FileOperationStatusEnumParameter FileOperationStatus;
        EnumParameterClasses::FileSelectorEnumParameter FileSelector;
        Pylon::CIntegerParameter FileSize;
        Pylon::CIntegerParameter FrameStartEventStreamChannelIndex;
        Pylon::CIntegerParameter FrameStartEventTimestamp;
        Pylon::CIntegerParameter FrameStartOvertriggerEventStreamChannelIndex;
        Pylon::CIntegerParameter FrameStartOvertriggerEventTimestamp;
        Pylon::CIntegerParameter FrameStartWaitEventStreamChannelIndex;
        Pylon::CIntegerParameter FrameStartWaitEventTimestamp;
        Pylon::CIntegerParameter FrameTimeoutEventStreamChannelIndex;
        Pylon::CIntegerParameter FrameTimeoutEventTimestamp;
        EnumParameterClasses::GainAutoEnumParameter GainAuto;
        Pylon::CIntegerParameter GainRaw;
        EnumParameterClasses::GainSelectorEnumParameter GainSelector;
        Pylon::CFloatParameter Gamma;
        Pylon::CBooleanParameter GammaEnable;
        EnumParameterClasses::GammaSelectorEnumParameter GammaSelector;
        EnumParameterClasses::GevCCPEnumParameter GevCCP;
        Pylon::CIntegerParameter GevCurrentDefaultGateway;
        Pylon::CIntegerParameter GevCurrentIPAddress;
        Pylon::CIntegerParameter GevCurrentIPConfiguration;
        Pylon::CIntegerParameter GevCurrentSubnetMask;
        Pylon::CIntegerParameter GevDeviceModeCharacterSet;
        Pylon::CBooleanParameter GevDeviceModeIsBigEndian;
        Pylon::CStringParameter GevFirstURL;
        Pylon::CIntegerParameter GevHeartbeatTimeout;
        Pylon::CBooleanParameter GevIEEE1588;
        Pylon::CIntegerParameter GevIEEE1588ClockId;
        Pylon::CCommandParameter GevIEEE1588DataSetLatch;
        Pylon::CIntegerParameter GevIEEE1588OffsetFromMaster;
        Pylon::CIntegerParameter GevIEEE1588ParentClockId;
        EnumParameterClasses::GevIEEE1588StatusEnumParameter GevIEEE1588Status;
        EnumParameterClasses::GevIEEE1588StatusLatchedEnumParameter GevIEEE1588StatusLatched;
        EnumParameterClasses::GevInterfaceSelectorEnumParameter GevInterfaceSelector;
        Pylon::CBooleanParameter GevLinkCrossover;
        Pylon::CBooleanParameter GevLinkFullDuplex;
        Pylon::CBooleanParameter GevLinkMaster;
        Pylon::CIntegerParameter GevLinkSpeed;
        Pylon::CIntegerParameter GevMACAddress;
        Pylon::CIntegerParameter GevMessageChannelCount;
        Pylon::CIntegerParameter GevNumberOfInterfaces;
        Pylon::CIntegerParameter GevPersistentDefaultGateway;
        Pylon::CIntegerParameter GevPersistentIPAddress;
        Pylon::CIntegerParameter GevPersistentSubnetMask;
        Pylon::CIntegerParameter GevSCBWA;
        Pylon::CIntegerParameter GevSCBWR;
        Pylon::CIntegerParameter GevSCBWRA;
        Pylon::CIntegerParameter GevSCDA;
        Pylon::CIntegerParameter GevSCDCT;
        Pylon::CIntegerParameter GevSCDMT;
        Pylon::CIntegerParameter GevSCFJM;
        Pylon::CIntegerParameter GevSCFTD;
        Pylon::CIntegerParameter GevSCPD;
        Pylon::CIntegerParameter GevSCPHostPort;
        Pylon::CIntegerParameter GevSCPInterfaceIndex;
        Pylon::CBooleanParameter GevSCPSBigEndian;
        Pylon::CBooleanParameter GevSCPSDoNotFragment;
        Pylon::CIntegerParameter GevSCPSPacketSize;
        Pylon::CStringParameter GevSecondURL;
        Pylon::CIntegerParameter GevStreamChannelCount;
        EnumParameterClasses::GevStreamChannelSelectorEnumParameter GevStreamChannelSelector;
        Pylon::CBooleanParameter GevSupportedIEEE1588;
        Pylon::CBooleanParameter GevSupportedIPConfigurationDHCP;
        Pylon::CBooleanParameter GevSupportedIPConfigurationLLA;
        Pylon::CBooleanParameter GevSupportedIPConfigurationPersistentIP;
        Pylon::CBooleanParameter GevSupportedOptionalCommandsConcatenation;
        Pylon::CBooleanParameter GevSupportedOptionalCommandsEVENT;
        Pylon::CBooleanParameter GevSupportedOptionalCommandsEVENTDATA;
        Pylon::CBooleanParameter GevSupportedOptionalCommandsPACKETRESEND;
        Pylon::CBooleanParameter GevSupportedOptionalCommandsWRITEMEM;
        Pylon::CBooleanParameter GevSupportedOptionalLegacy16BitBlockID;
        Pylon::CCommandParameter GevTimestampControlLatch;
        Pylon::CCommandParameter GevTimestampControlLatchReset;
        Pylon::CCommandParameter GevTimestampControlReset;
        Pylon::CIntegerParameter GevTimestampTickFrequency;
        Pylon::CIntegerParameter GevTimestampValue;
        Pylon::CIntegerParameter GevVersionMajor;
        Pylon::CIntegerParameter GevVersionMinor;
        Pylon::CFloatParameter GrayValueAdjustmentDampingAbs;
        Pylon::CIntegerParameter GrayValueAdjustmentDampingRaw;
        Pylon::CIntegerParameter Height;
        Pylon::CIntegerParameter HeightMax;
        Pylon::CBooleanParameter LUTEnable;
        Pylon::CIntegerParameter LUTIndex;
        EnumParameterClasses::LUTSelectorEnumParameter LUTSelector;
        Pylon::CIntegerParameter LUTValue;
        Pylon::CArrayParameter LUTValueAll;
        EnumParameterClasses::LastErrorEnumParameter LastError;
        EnumParameterClasses::LightSourceSelectorEnumParameter LightSourceSelector;
        Pylon::CIntegerParameter Line1RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter Line1RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter Line2RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter Line2RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter Line3RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter Line3RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter Line4RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter Line4RisingEdgeEventTimestamp;
        Pylon::CFloatParameter LineDebouncerTimeAbs;
        EnumParameterClasses::LineFormatEnumParameter LineFormat;
        Pylon::CBooleanParameter LineInverter;
        EnumParameterClasses::LineLogicEnumParameter LineLogic;
        EnumParameterClasses::LineModeEnumParameter LineMode;
        EnumParameterClasses::LineSelectorEnumParameter LineSelector;
        EnumParameterClasses::LineSourceEnumParameter LineSource;
        Pylon::CIntegerParameter LineStartOvertriggerEventStreamChannelIndex;
        Pylon::CIntegerParameter LineStartOvertriggerEventTimestamp;
        Pylon::CBooleanParameter LineStatus;
        Pylon::CIntegerParameter LineStatusAll;
        Pylon::CBooleanParameter LineTermination;
        Pylon::CFloatParameter MinOutPulseWidthAbs;
        Pylon::CFloatParameter NoiseReductionAbs;
        Pylon::CIntegerParameter NoiseReductionRaw;
        Pylon::CIntegerParameter NumberOfActionSignals;
        Pylon::CIntegerParameter OffsetX;
        Pylon::CIntegerParameter OffsetY;
        Pylon::CBooleanParameter OverTemperature;
        Pylon::CIntegerParameter OverTemperatureEventStreamChannelIndex;
        Pylon::CIntegerParameter OverTemperatureEventTimestamp;
        EnumParameterClasses::ParameterSelectorEnumParameter ParameterSelector;
        Pylon::CIntegerParameter PayloadSize;
        EnumParameterClasses::PixelColorFilterEnumParameter PixelColorFilter;
        Pylon::CIntegerParameter PixelDynamicRangeMax;
        Pylon::CIntegerParameter PixelDynamicRangeMin;
        EnumParameterClasses::PixelFormatEnumParameter PixelFormat;
        EnumParameterClasses::PixelSizeEnumParameter PixelSize;
        Pylon::CFloatParameter ReadoutTimeAbs;
        Pylon::CBooleanParameter RemoveLimits;
        Pylon::CFloatParameter ResultingFramePeriodAbs;
        Pylon::CFloatParameter ResultingFrameRateAbs;
        Pylon::CBooleanParameter ReverseX;
        Pylon::CBooleanParameter ReverseY;
        Pylon::CFloatParameter ScalingHorizontalAbs;
        Pylon::CFloatParameter ScalingVerticalAbs;
        Pylon::CIntegerParameter SensorHeight;
        EnumParameterClasses::SensorReadoutModeEnumParameter SensorReadoutMode;
        Pylon::CIntegerParameter SensorWidth;
        EnumParameterClasses::SequenceAddressBitSelectorEnumParameter SequenceAddressBitSelector;
        EnumParameterClasses::SequenceAddressBitSourceEnumParameter SequenceAddressBitSource;
        EnumParameterClasses::SequenceAdvanceModeEnumParameter SequenceAdvanceMode;
        Pylon::CCommandParameter SequenceAsyncAdvance;
        Pylon::CCommandParameter SequenceAsyncRestart;
        EnumParameterClasses::SequenceConfigurationModeEnumParameter SequenceConfigurationMode;
        EnumParameterClasses::SequenceControlSelectorEnumParameter SequenceControlSelector;
        EnumParameterClasses::SequenceControlSourceEnumParameter SequenceControlSource;
        Pylon::CIntegerParameter SequenceCurrentSet;
        Pylon::CBooleanParameter SequenceEnable;
        Pylon::CIntegerParameter SequenceSetExecutions;
        Pylon::CIntegerParameter SequenceSetIndex;
        Pylon::CCommandParameter SequenceSetLoad;
        Pylon::CCommandParameter SequenceSetStore;
        Pylon::CIntegerParameter SequenceSetTotalNumber;
        Pylon::CFloatParameter SharpnessEnhancementAbs;
        Pylon::CIntegerParameter SharpnessEnhancementRaw;
        EnumParameterClasses::ShutterModeEnumParameter ShutterMode;
        Pylon::CBooleanParameter SyncFreeRunTimerEnable;
        Pylon::CIntegerParameter SyncFreeRunTimerStartTimeHigh;
        Pylon::CIntegerParameter SyncFreeRunTimerStartTimeLow;
        Pylon::CFloatParameter SyncFreeRunTimerTriggerRateAbs;
        Pylon::CCommandParameter SyncFreeRunTimerUpdate;
        EnumParameterClasses::SyncUserOutputSelectorEnumParameter SyncUserOutputSelector;
        Pylon::CBooleanParameter SyncUserOutputValue;
        Pylon::CIntegerParameter SyncUserOutputValueAll;
        Pylon::CFloatParameter TemperatureAbs;
        EnumParameterClasses::TemperatureSelectorEnumParameter TemperatureSelector;
        EnumParameterClasses::TemperatureStateEnumParameter TemperatureState;
        Pylon::CBooleanParameter TestImageResetAndHold;
        EnumParameterClasses::TestImageSelectorEnumParameter TestImageSelector;
        Pylon::CFloatParameter TimerDelayAbs;
        Pylon::CIntegerParameter TimerDelayRaw;
        Pylon::CFloatParameter TimerDurationAbs;
        Pylon::CIntegerParameter TimerDurationRaw;
        EnumParameterClasses::TimerSelectorEnumParameter TimerSelector;
        EnumParameterClasses::TimerTriggerActivationEnumParameter TimerTriggerActivation;
        EnumParameterClasses::TimerTriggerSourceEnumParameter TimerTriggerSource;
        EnumParameterClasses::TriggerActivationEnumParameter TriggerActivation;
        Pylon::CFloatParameter TriggerDelayAbs;
        EnumParameterClasses::TriggerModeEnumParameter TriggerMode;
        EnumParameterClasses::TriggerSelectorEnumParameter TriggerSelector;
        Pylon::CCommandParameter TriggerSoftware;
        EnumParameterClasses::TriggerSourceEnumParameter TriggerSource;
        Pylon::CIntegerParameter UserDefinedValue;
        EnumParameterClasses::UserDefinedValueSelectorEnumParameter UserDefinedValueSelector;
        EnumParameterClasses::UserOutputSelectorEnumParameter UserOutputSelector;
        Pylon::CBooleanParameter UserOutputValue;
        Pylon::CIntegerParameter UserOutputValueAll;
        EnumParameterClasses::UserSetDefaultSelectorEnumParameter UserSetDefaultSelector;
        Pylon::CCommandParameter UserSetLoad;
        Pylon::CCommandParameter UserSetSave;
        EnumParameterClasses::UserSetSelectorEnumParameter UserSetSelector;
        Pylon::CIntegerParameter VirtualLine1RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter VirtualLine1RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter VirtualLine2RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter VirtualLine2RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter VirtualLine3RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter VirtualLine3RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter VirtualLine4RisingEdgeEventStreamChannelIndex;
        Pylon::CIntegerParameter VirtualLine4RisingEdgeEventTimestamp;
        Pylon::CIntegerParameter Width;
        Pylon::CIntegerParameter WidthMax;
    };


    ///////////////////////////////////////////////////////////////////////////
    //
    BaslerCameraCameraParams::BaslerCameraCameraParams(void)
        : m_pData(new BaslerCameraCameraParams_Data())
        , AcquisitionFrameCount(m_pData->AcquisitionFrameCount)
        , AcquisitionFrameRateAbs(m_pData->AcquisitionFrameRateAbs)
        , AcquisitionFrameRateEnable(m_pData->AcquisitionFrameRateEnable)
        , AcquisitionMode(m_pData->AcquisitionMode)
        , AcquisitionStart(m_pData->AcquisitionStart)
        , AcquisitionStartEventStreamChannelIndex(m_pData->AcquisitionStartEventStreamChannelIndex)
        , AcquisitionStartEventTimestamp(m_pData->AcquisitionStartEventTimestamp)
        , AcquisitionStartOvertriggerEventStreamChannelIndex(m_pData->AcquisitionStartOvertriggerEventStreamChannelIndex)
        , AcquisitionStartOvertriggerEventTimestamp(m_pData->AcquisitionStartOvertriggerEventTimestamp)
        , AcquisitionStartWaitEventStreamChannelIndex(m_pData->AcquisitionStartWaitEventStreamChannelIndex)
        , AcquisitionStartWaitEventTimestamp(m_pData->AcquisitionStartWaitEventTimestamp)
        , AcquisitionStatus(m_pData->AcquisitionStatus)
        , AcquisitionStatusSelector(m_pData->AcquisitionStatusSelector)
        , AcquisitionStop(m_pData->AcquisitionStop)
        , ActionDeviceKey(m_pData->ActionDeviceKey)
        , ActionGroupKey(m_pData->ActionGroupKey)
        , ActionGroupMask(m_pData->ActionGroupMask)
        , ActionLateEventStreamChannelIndex(m_pData->ActionLateEventStreamChannelIndex)
        , ActionLateEventTimestamp(m_pData->ActionLateEventTimestamp)
        , ActionSelector(m_pData->ActionSelector)
        , AutoExposureTimeAbsLowerLimit(m_pData->AutoExposureTimeAbsLowerLimit)
        , AutoExposureTimeAbsUpperLimit(m_pData->AutoExposureTimeAbsUpperLimit)
        , AutoFunctionAOIHeight(m_pData->AutoFunctionAOIHeight)
        , AutoFunctionAOIOffsetX(m_pData->AutoFunctionAOIOffsetX)
        , AutoFunctionAOIOffsetY(m_pData->AutoFunctionAOIOffsetY)
        , AutoFunctionAOISelector(m_pData->AutoFunctionAOISelector)
        , AutoFunctionAOIUsageIntensity(m_pData->AutoFunctionAOIUsageIntensity)
        , AutoFunctionAOIUsageWhiteBalance(m_pData->AutoFunctionAOIUsageWhiteBalance)
        , AutoFunctionAOIWidth(m_pData->AutoFunctionAOIWidth)
        , AutoFunctionProfile(m_pData->AutoFunctionProfile)
        , AutoGainRawLowerLimit(m_pData->AutoGainRawLowerLimit)
        , AutoGainRawUpperLimit(m_pData->AutoGainRawUpperLimit)
        , AutoTargetValue(m_pData->AutoTargetValue)
        , BalanceRatioAbs(m_pData->BalanceRatioAbs)
        , BalanceRatioRaw(m_pData->BalanceRatioRaw)
        , BalanceRatioSelector(m_pData->BalanceRatioSelector)
        , BalanceWhiteAdjustmentDampingAbs(m_pData->BalanceWhiteAdjustmentDampingAbs)
        , BalanceWhiteAdjustmentDampingRaw(m_pData->BalanceWhiteAdjustmentDampingRaw)
        , BalanceWhiteAuto(m_pData->BalanceWhiteAuto)
        , BalanceWhiteReset(m_pData->BalanceWhiteReset)
        , BinningHorizontal(m_pData->BinningHorizontal)
        , BinningHorizontalMode(m_pData->BinningHorizontalMode)
        , BinningVertical(m_pData->BinningVertical)
        , BinningVerticalMode(m_pData->BinningVerticalMode)
        , BlackLevelRaw(m_pData->BlackLevelRaw)
        , BlackLevelSelector(m_pData->BlackLevelSelector)
        , CenterX(m_pData->CenterX)
        , CenterY(m_pData->CenterY)
        , ChunkEnable(m_pData->ChunkEnable)
        , ChunkModeActive(m_pData->ChunkModeActive)
        , ChunkSelector(m_pData->ChunkSelector)
        , ClearLastError(m_pData->ClearLastError)
        , ColorAdjustmentEnable(m_pData->ColorAdjustmentEnable)
        , ColorAdjustmentHue(m_pData->ColorAdjustmentHue)
        , ColorAdjustmentHueRaw(m_pData->ColorAdjustmentHueRaw)
        , ColorAdjustmentReset(m_pData->ColorAdjustmentReset)
        , ColorAdjustmentSaturation(m_pData->ColorAdjustmentSaturation)
        , ColorAdjustmentSaturationRaw(m_pData->ColorAdjustmentSaturationRaw)
        , ColorAdjustmentSelector(m_pData->ColorAdjustmentSelector)
        , ColorTransformationMatrixFactor(m_pData->ColorTransformationMatrixFactor)
        , ColorTransformationMatrixFactorRaw(m_pData->ColorTransformationMatrixFactorRaw)
        , ColorTransformationSelector(m_pData->ColorTransformationSelector)
        , ColorTransformationValue(m_pData->ColorTransformationValue)
        , ColorTransformationValueRaw(m_pData->ColorTransformationValueRaw)
        , ColorTransformationValueSelector(m_pData->ColorTransformationValueSelector)
        , CounterEventSource(m_pData->CounterEventSource)
        , CounterReset(m_pData->CounterReset)
        , CounterResetSource(m_pData->CounterResetSource)
        , CounterSelector(m_pData->CounterSelector)
        , CriticalTemperature(m_pData->CriticalTemperature)
        , CriticalTemperatureEventStreamChannelIndex(m_pData->CriticalTemperatureEventStreamChannelIndex)
        , CriticalTemperatureEventTimestamp(m_pData->CriticalTemperatureEventTimestamp)
        , DecimationHorizontal(m_pData->DecimationHorizontal)
        , DecimationVertical(m_pData->DecimationVertical)
        , DemosaicingMode(m_pData->DemosaicingMode)
        , DeviceFirmwareVersion(m_pData->DeviceFirmwareVersion)
        , DeviceID(m_pData->DeviceID)
        , DeviceManufacturerInfo(m_pData->DeviceManufacturerInfo)
        , DeviceModelName(m_pData->DeviceModelName)
        , DeviceRegistersStreamingEnd(m_pData->DeviceRegistersStreamingEnd)
        , DeviceRegistersStreamingStart(m_pData->DeviceRegistersStreamingStart)
        , DeviceReset(m_pData->DeviceReset)
        , DeviceScanType(m_pData->DeviceScanType)
        , DeviceUserID(m_pData->DeviceUserID)
        , DeviceVendorName(m_pData->DeviceVendorName)
        , DeviceVersion(m_pData->DeviceVersion)
        , DigitalShift(m_pData->DigitalShift)
        , EnableBurstAcquisition(m_pData->EnableBurstAcquisition)
        , EventNotification(m_pData->EventNotification)
        , EventOverrunEventFrameID(m_pData->EventOverrunEventFrameID)
        , EventOverrunEventStreamChannelIndex(m_pData->EventOverrunEventStreamChannelIndex)
        , EventOverrunEventTimestamp(m_pData->EventOverrunEventTimestamp)
        , EventSelector(m_pData->EventSelector)
        , ExpertFeatureAccessKey(m_pData->ExpertFeatureAccessKey)
        , ExpertFeatureAccessSelector(m_pData->ExpertFeatureAccessSelector)
        , ExpertFeatureEnable(m_pData->ExpertFeatureEnable)
        , ExposureAuto(m_pData->ExposureAuto)
        , ExposureEndEventFrameID(m_pData->ExposureEndEventFrameID)
        , ExposureEndEventStreamChannelIndex(m_pData->ExposureEndEventStreamChannelIndex)
        , ExposureEndEventTimestamp(m_pData->ExposureEndEventTimestamp)
        , ExposureMode(m_pData->ExposureMode)
        , ExposureOverlapTimeMaxAbs(m_pData->ExposureOverlapTimeMaxAbs)
        , ExposureOverlapTimeMaxRaw(m_pData->ExposureOverlapTimeMaxRaw)
        , ExposureOverlapTimeMode(m_pData->ExposureOverlapTimeMode)
        , ExposureTimeAbs(m_pData->ExposureTimeAbs)
        , ExposureTimeRaw(m_pData->ExposureTimeRaw)
        , FileAccessBuffer(m_pData->FileAccessBuffer)
        , FileAccessLength(m_pData->FileAccessLength)
        , FileAccessOffset(m_pData->FileAccessOffset)
        , FileOpenMode(m_pData->FileOpenMode)
        , FileOperationExecute(m_pData->FileOperationExecute)
        , FileOperationResult(m_pData->FileOperationResult)
        , FileOperationSelector(m_pData->FileOperationSelector)
        , FileOperationStatus(m_pData->FileOperationStatus)
        , FileSelector(m_pData->FileSelector)
        , FileSize(m_pData->FileSize)
        , FrameStartEventStreamChannelIndex(m_pData->FrameStartEventStreamChannelIndex)
        , FrameStartEventTimestamp(m_pData->FrameStartEventTimestamp)
        , FrameStartOvertriggerEventStreamChannelIndex(m_pData->FrameStartOvertriggerEventStreamChannelIndex)
        , FrameStartOvertriggerEventTimestamp(m_pData->FrameStartOvertriggerEventTimestamp)
        , FrameStartWaitEventStreamChannelIndex(m_pData->FrameStartWaitEventStreamChannelIndex)
        , FrameStartWaitEventTimestamp(m_pData->FrameStartWaitEventTimestamp)
        , FrameTimeoutEventStreamChannelIndex(m_pData->FrameTimeoutEventStreamChannelIndex)
        , FrameTimeoutEventTimestamp(m_pData->FrameTimeoutEventTimestamp)
        , GainAuto(m_pData->GainAuto)
        , GainRaw(m_pData->GainRaw)
        , GainSelector(m_pData->GainSelector)
        , Gamma(m_pData->Gamma)
        , GammaEnable(m_pData->GammaEnable)
        , GammaSelector(m_pData->GammaSelector)
        , GevCCP(m_pData->GevCCP)
        , GevCurrentDefaultGateway(m_pData->GevCurrentDefaultGateway)
        , GevCurrentIPAddress(m_pData->GevCurrentIPAddress)
        , GevCurrentIPConfiguration(m_pData->GevCurrentIPConfiguration)
        , GevCurrentSubnetMask(m_pData->GevCurrentSubnetMask)
        , GevDeviceModeCharacterSet(m_pData->GevDeviceModeCharacterSet)
        , GevDeviceModeIsBigEndian(m_pData->GevDeviceModeIsBigEndian)
        , GevFirstURL(m_pData->GevFirstURL)
        , GevHeartbeatTimeout(m_pData->GevHeartbeatTimeout)
        , GevIEEE1588(m_pData->GevIEEE1588)
        , GevIEEE1588ClockId(m_pData->GevIEEE1588ClockId)
        , GevIEEE1588DataSetLatch(m_pData->GevIEEE1588DataSetLatch)
        , GevIEEE1588OffsetFromMaster(m_pData->GevIEEE1588OffsetFromMaster)
        , GevIEEE1588ParentClockId(m_pData->GevIEEE1588ParentClockId)
        , GevIEEE1588Status(m_pData->GevIEEE1588Status)
        , GevIEEE1588StatusLatched(m_pData->GevIEEE1588StatusLatched)
        , GevInterfaceSelector(m_pData->GevInterfaceSelector)
        , GevLinkCrossover(m_pData->GevLinkCrossover)
        , GevLinkFullDuplex(m_pData->GevLinkFullDuplex)
        , GevLinkMaster(m_pData->GevLinkMaster)
        , GevLinkSpeed(m_pData->GevLinkSpeed)
        , GevMACAddress(m_pData->GevMACAddress)
        , GevMessageChannelCount(m_pData->GevMessageChannelCount)
        , GevNumberOfInterfaces(m_pData->GevNumberOfInterfaces)
        , GevPersistentDefaultGateway(m_pData->GevPersistentDefaultGateway)
        , GevPersistentIPAddress(m_pData->GevPersistentIPAddress)
        , GevPersistentSubnetMask(m_pData->GevPersistentSubnetMask)
        , GevSCBWA(m_pData->GevSCBWA)
        , GevSCBWR(m_pData->GevSCBWR)
        , GevSCBWRA(m_pData->GevSCBWRA)
        , GevSCDA(m_pData->GevSCDA)
        , GevSCDCT(m_pData->GevSCDCT)
        , GevSCDMT(m_pData->GevSCDMT)
        , GevSCFJM(m_pData->GevSCFJM)
        , GevSCFTD(m_pData->GevSCFTD)
        , GevSCPD(m_pData->GevSCPD)
        , GevSCPHostPort(m_pData->GevSCPHostPort)
        , GevSCPInterfaceIndex(m_pData->GevSCPInterfaceIndex)
        , GevSCPSBigEndian(m_pData->GevSCPSBigEndian)
        , GevSCPSDoNotFragment(m_pData->GevSCPSDoNotFragment)
        , GevSCPSPacketSize(m_pData->GevSCPSPacketSize)
        , GevSecondURL(m_pData->GevSecondURL)
        , GevStreamChannelCount(m_pData->GevStreamChannelCount)
        , GevStreamChannelSelector(m_pData->GevStreamChannelSelector)
        , GevSupportedIEEE1588(m_pData->GevSupportedIEEE1588)
        , GevSupportedIPConfigurationDHCP(m_pData->GevSupportedIPConfigurationDHCP)
        , GevSupportedIPConfigurationLLA(m_pData->GevSupportedIPConfigurationLLA)
        , GevSupportedIPConfigurationPersistentIP(m_pData->GevSupportedIPConfigurationPersistentIP)
        , GevSupportedOptionalCommandsConcatenation(m_pData->GevSupportedOptionalCommandsConcatenation)
        , GevSupportedOptionalCommandsEVENT(m_pData->GevSupportedOptionalCommandsEVENT)
        , GevSupportedOptionalCommandsEVENTDATA(m_pData->GevSupportedOptionalCommandsEVENTDATA)
        , GevSupportedOptionalCommandsPACKETRESEND(m_pData->GevSupportedOptionalCommandsPACKETRESEND)
        , GevSupportedOptionalCommandsWRITEMEM(m_pData->GevSupportedOptionalCommandsWRITEMEM)
        , GevSupportedOptionalLegacy16BitBlockID(m_pData->GevSupportedOptionalLegacy16BitBlockID)
        , GevTimestampControlLatch(m_pData->GevTimestampControlLatch)
        , GevTimestampControlLatchReset(m_pData->GevTimestampControlLatchReset)
        , GevTimestampControlReset(m_pData->GevTimestampControlReset)
        , GevTimestampTickFrequency(m_pData->GevTimestampTickFrequency)
        , GevTimestampValue(m_pData->GevTimestampValue)
        , GevVersionMajor(m_pData->GevVersionMajor)
        , GevVersionMinor(m_pData->GevVersionMinor)
        , GrayValueAdjustmentDampingAbs(m_pData->GrayValueAdjustmentDampingAbs)
        , GrayValueAdjustmentDampingRaw(m_pData->GrayValueAdjustmentDampingRaw)
        , Height(m_pData->Height)
        , HeightMax(m_pData->HeightMax)
        , LUTEnable(m_pData->LUTEnable)
        , LUTIndex(m_pData->LUTIndex)
        , LUTSelector(m_pData->LUTSelector)
        , LUTValue(m_pData->LUTValue)
        , LUTValueAll(m_pData->LUTValueAll)
        , LastError(m_pData->LastError)
        , LightSourceSelector(m_pData->LightSourceSelector)
        , Line1RisingEdgeEventStreamChannelIndex(m_pData->Line1RisingEdgeEventStreamChannelIndex)
        , Line1RisingEdgeEventTimestamp(m_pData->Line1RisingEdgeEventTimestamp)
        , Line2RisingEdgeEventStreamChannelIndex(m_pData->Line2RisingEdgeEventStreamChannelIndex)
        , Line2RisingEdgeEventTimestamp(m_pData->Line2RisingEdgeEventTimestamp)
        , Line3RisingEdgeEventStreamChannelIndex(m_pData->Line3RisingEdgeEventStreamChannelIndex)
        , Line3RisingEdgeEventTimestamp(m_pData->Line3RisingEdgeEventTimestamp)
        , Line4RisingEdgeEventStreamChannelIndex(m_pData->Line4RisingEdgeEventStreamChannelIndex)
        , Line4RisingEdgeEventTimestamp(m_pData->Line4RisingEdgeEventTimestamp)
        , LineDebouncerTimeAbs(m_pData->LineDebouncerTimeAbs)
        , LineFormat(m_pData->LineFormat)
        , LineInverter(m_pData->LineInverter)
        , LineLogic(m_pData->LineLogic)
        , LineMode(m_pData->LineMode)
        , LineSelector(m_pData->LineSelector)
        , LineSource(m_pData->LineSource)
        , LineStartOvertriggerEventStreamChannelIndex(m_pData->LineStartOvertriggerEventStreamChannelIndex)
        , LineStartOvertriggerEventTimestamp(m_pData->LineStartOvertriggerEventTimestamp)
        , LineStatus(m_pData->LineStatus)
        , LineStatusAll(m_pData->LineStatusAll)
        , LineTermination(m_pData->LineTermination)
        , MinOutPulseWidthAbs(m_pData->MinOutPulseWidthAbs)
        , NoiseReductionAbs(m_pData->NoiseReductionAbs)
        , NoiseReductionRaw(m_pData->NoiseReductionRaw)
        , NumberOfActionSignals(m_pData->NumberOfActionSignals)
        , OffsetX(m_pData->OffsetX)
        , OffsetY(m_pData->OffsetY)
        , OverTemperature(m_pData->OverTemperature)
        , OverTemperatureEventStreamChannelIndex(m_pData->OverTemperatureEventStreamChannelIndex)
        , OverTemperatureEventTimestamp(m_pData->OverTemperatureEventTimestamp)
        , ParameterSelector(m_pData->ParameterSelector)
        , PayloadSize(m_pData->PayloadSize)
        , PixelColorFilter(m_pData->PixelColorFilter)
        , PixelDynamicRangeMax(m_pData->PixelDynamicRangeMax)
        , PixelDynamicRangeMin(m_pData->PixelDynamicRangeMin)
        , PixelFormat(m_pData->PixelFormat)
        , PixelSize(m_pData->PixelSize)
        , ReadoutTimeAbs(m_pData->ReadoutTimeAbs)
        , RemoveLimits(m_pData->RemoveLimits)
        , ResultingFramePeriodAbs(m_pData->ResultingFramePeriodAbs)
        , ResultingFrameRateAbs(m_pData->ResultingFrameRateAbs)
        , ReverseX(m_pData->ReverseX)
        , ReverseY(m_pData->ReverseY)
        , ScalingHorizontalAbs(m_pData->ScalingHorizontalAbs)
        , ScalingVerticalAbs(m_pData->ScalingVerticalAbs)
        , SensorHeight(m_pData->SensorHeight)
        , SensorReadoutMode(m_pData->SensorReadoutMode)
        , SensorWidth(m_pData->SensorWidth)
        , SequenceAddressBitSelector(m_pData->SequenceAddressBitSelector)
        , SequenceAddressBitSource(m_pData->SequenceAddressBitSource)
        , SequenceAdvanceMode(m_pData->SequenceAdvanceMode)
        , SequenceAsyncAdvance(m_pData->SequenceAsyncAdvance)
        , SequenceAsyncRestart(m_pData->SequenceAsyncRestart)
        , SequenceConfigurationMode(m_pData->SequenceConfigurationMode)
        , SequenceControlSelector(m_pData->SequenceControlSelector)
        , SequenceControlSource(m_pData->SequenceControlSource)
        , SequenceCurrentSet(m_pData->SequenceCurrentSet)
        , SequenceEnable(m_pData->SequenceEnable)
        , SequenceSetExecutions(m_pData->SequenceSetExecutions)
        , SequenceSetIndex(m_pData->SequenceSetIndex)
        , SequenceSetLoad(m_pData->SequenceSetLoad)
        , SequenceSetStore(m_pData->SequenceSetStore)
        , SequenceSetTotalNumber(m_pData->SequenceSetTotalNumber)
        , SharpnessEnhancementAbs(m_pData->SharpnessEnhancementAbs)
        , SharpnessEnhancementRaw(m_pData->SharpnessEnhancementRaw)
        , ShutterMode(m_pData->ShutterMode)
        , SyncFreeRunTimerEnable(m_pData->SyncFreeRunTimerEnable)
        , SyncFreeRunTimerStartTimeHigh(m_pData->SyncFreeRunTimerStartTimeHigh)
        , SyncFreeRunTimerStartTimeLow(m_pData->SyncFreeRunTimerStartTimeLow)
        , SyncFreeRunTimerTriggerRateAbs(m_pData->SyncFreeRunTimerTriggerRateAbs)
        , SyncFreeRunTimerUpdate(m_pData->SyncFreeRunTimerUpdate)
        , SyncUserOutputSelector(m_pData->SyncUserOutputSelector)
        , SyncUserOutputValue(m_pData->SyncUserOutputValue)
        , SyncUserOutputValueAll(m_pData->SyncUserOutputValueAll)
        , TemperatureAbs(m_pData->TemperatureAbs)
        , TemperatureSelector(m_pData->TemperatureSelector)
        , TemperatureState(m_pData->TemperatureState)
        , TestImageResetAndHold(m_pData->TestImageResetAndHold)
        , TestImageSelector(m_pData->TestImageSelector)
        , TimerDelayAbs(m_pData->TimerDelayAbs)
        , TimerDelayRaw(m_pData->TimerDelayRaw)
        , TimerDurationAbs(m_pData->TimerDurationAbs)
        , TimerDurationRaw(m_pData->TimerDurationRaw)
        , TimerSelector(m_pData->TimerSelector)
        , TimerTriggerActivation(m_pData->TimerTriggerActivation)
        , TimerTriggerSource(m_pData->TimerTriggerSource)
        , TriggerActivation(m_pData->TriggerActivation)
        , TriggerDelayAbs(m_pData->TriggerDelayAbs)
        , TriggerMode(m_pData->TriggerMode)
        , TriggerSelector(m_pData->TriggerSelector)
        , TriggerSoftware(m_pData->TriggerSoftware)
        , TriggerSource(m_pData->TriggerSource)
        , UserDefinedValue(m_pData->UserDefinedValue)
        , UserDefinedValueSelector(m_pData->UserDefinedValueSelector)
        , UserOutputSelector(m_pData->UserOutputSelector)
        , UserOutputValue(m_pData->UserOutputValue)
        , UserOutputValueAll(m_pData->UserOutputValueAll)
        , UserSetDefaultSelector(m_pData->UserSetDefaultSelector)
        , UserSetLoad(m_pData->UserSetLoad)
        , UserSetSave(m_pData->UserSetSave)
        , UserSetSelector(m_pData->UserSetSelector)
        , VirtualLine1RisingEdgeEventStreamChannelIndex(m_pData->VirtualLine1RisingEdgeEventStreamChannelIndex)
        , VirtualLine1RisingEdgeEventTimestamp(m_pData->VirtualLine1RisingEdgeEventTimestamp)
        , VirtualLine2RisingEdgeEventStreamChannelIndex(m_pData->VirtualLine2RisingEdgeEventStreamChannelIndex)
        , VirtualLine2RisingEdgeEventTimestamp(m_pData->VirtualLine2RisingEdgeEventTimestamp)
        , VirtualLine3RisingEdgeEventStreamChannelIndex(m_pData->VirtualLine3RisingEdgeEventStreamChannelIndex)
        , VirtualLine3RisingEdgeEventTimestamp(m_pData->VirtualLine3RisingEdgeEventTimestamp)
        , VirtualLine4RisingEdgeEventStreamChannelIndex(m_pData->VirtualLine4RisingEdgeEventStreamChannelIndex)
        , VirtualLine4RisingEdgeEventTimestamp(m_pData->VirtualLine4RisingEdgeEventTimestamp)
        , Width(m_pData->Width)
        , WidthMax(m_pData->WidthMax)
    {
    }


    ///////////////////////////////////////////////////////////////////////////
    //
    BaslerCameraCameraParams::~BaslerCameraCameraParams(void)
    {
        delete m_pData;
    }


    ///////////////////////////////////////////////////////////////////////////
    //
    void BaslerCameraCameraParams::_Initialize(GENAPI_NAMESPACE::INodeMap* pNodeMap)
    {
        m_pData->AcquisitionFrameCount.Attach(pNodeMap, "AcquisitionFrameCount");
        m_pData->AcquisitionFrameRateAbs.Attach(pNodeMap, "AcquisitionFrameRateAbs");
        m_pData->AcquisitionFrameRateEnable.Attach(pNodeMap, "AcquisitionFrameRateEnable");
        m_pData->AcquisitionMode.Attach(pNodeMap, "AcquisitionMode");
        m_pData->AcquisitionStart.Attach(pNodeMap, "AcquisitionStart");
        m_pData->AcquisitionStartEventStreamChannelIndex.Attach(pNodeMap, "AcquisitionStartEventStreamChannelIndex");
        m_pData->AcquisitionStartEventTimestamp.Attach(pNodeMap, "AcquisitionStartEventTimestamp");
        m_pData->AcquisitionStartOvertriggerEventStreamChannelIndex.Attach(pNodeMap, "AcquisitionStartOvertriggerEventStreamChannelIndex");
        m_pData->AcquisitionStartOvertriggerEventTimestamp.Attach(pNodeMap, "AcquisitionStartOvertriggerEventTimestamp");
        m_pData->AcquisitionStartWaitEventStreamChannelIndex.Attach(pNodeMap, "AcquisitionStartWaitEventStreamChannelIndex");
        m_pData->AcquisitionStartWaitEventTimestamp.Attach(pNodeMap, "AcquisitionStartWaitEventTimestamp");
        m_pData->AcquisitionStatus.Attach(pNodeMap, "AcquisitionStatus");
        m_pData->AcquisitionStatusSelector.Attach(pNodeMap, "AcquisitionStatusSelector");
        m_pData->AcquisitionStop.Attach(pNodeMap, "AcquisitionStop");
        m_pData->ActionDeviceKey.Attach(pNodeMap, "ActionDeviceKey");
        m_pData->ActionGroupKey.Attach(pNodeMap, "ActionGroupKey");
        m_pData->ActionGroupMask.Attach(pNodeMap, "ActionGroupMask");
        m_pData->ActionLateEventStreamChannelIndex.Attach(pNodeMap, "ActionLateEventStreamChannelIndex");
        m_pData->ActionLateEventTimestamp.Attach(pNodeMap, "ActionLateEventTimestamp");
        m_pData->ActionSelector.Attach(pNodeMap, "ActionSelector");
        m_pData->AutoExposureTimeAbsLowerLimit.Attach(pNodeMap, "AutoExposureTimeAbsLowerLimit");
        m_pData->AutoExposureTimeAbsUpperLimit.Attach(pNodeMap, "AutoExposureTimeAbsUpperLimit");
        m_pData->AutoFunctionAOIHeight.Attach(pNodeMap, "AutoFunctionAOIHeight");
        m_pData->AutoFunctionAOIOffsetX.Attach(pNodeMap, "AutoFunctionAOIOffsetX");
        m_pData->AutoFunctionAOIOffsetY.Attach(pNodeMap, "AutoFunctionAOIOffsetY");
        m_pData->AutoFunctionAOISelector.Attach(pNodeMap, "AutoFunctionAOISelector");
        m_pData->AutoFunctionAOIUsageIntensity.Attach(pNodeMap, "AutoFunctionAOIUsageIntensity");
        m_pData->AutoFunctionAOIUsageWhiteBalance.Attach(pNodeMap, "AutoFunctionAOIUsageWhiteBalance");
        m_pData->AutoFunctionAOIWidth.Attach(pNodeMap, "AutoFunctionAOIWidth");
        m_pData->AutoFunctionProfile.Attach(pNodeMap, "AutoFunctionProfile");
        m_pData->AutoGainRawLowerLimit.Attach(pNodeMap, "AutoGainRawLowerLimit");
        m_pData->AutoGainRawUpperLimit.Attach(pNodeMap, "AutoGainRawUpperLimit");
        m_pData->AutoTargetValue.Attach(pNodeMap, "AutoTargetValue");
        m_pData->BalanceRatioAbs.Attach(pNodeMap, "BalanceRatioAbs");
        m_pData->BalanceRatioRaw.Attach(pNodeMap, "BalanceRatioRaw");
        m_pData->BalanceRatioSelector.Attach(pNodeMap, "BalanceRatioSelector");
        m_pData->BalanceWhiteAdjustmentDampingAbs.Attach(pNodeMap, "BalanceWhiteAdjustmentDampingAbs");
        m_pData->BalanceWhiteAdjustmentDampingRaw.Attach(pNodeMap, "BalanceWhiteAdjustmentDampingRaw");
        m_pData->BalanceWhiteAuto.Attach(pNodeMap, "BalanceWhiteAuto");
        m_pData->BalanceWhiteReset.Attach(pNodeMap, "BalanceWhiteReset");
        m_pData->BinningHorizontal.Attach(pNodeMap, "BinningHorizontal");
        m_pData->BinningHorizontalMode.Attach(pNodeMap, "BinningHorizontalMode");
        m_pData->BinningVertical.Attach(pNodeMap, "BinningVertical");
        m_pData->BinningVerticalMode.Attach(pNodeMap, "BinningVerticalMode");
        m_pData->BlackLevelRaw.Attach(pNodeMap, "BlackLevelRaw");
        m_pData->BlackLevelSelector.Attach(pNodeMap, "BlackLevelSelector");
        m_pData->CenterX.Attach(pNodeMap, "CenterX");
        m_pData->CenterY.Attach(pNodeMap, "CenterY");
        m_pData->ChunkEnable.Attach(pNodeMap, "ChunkEnable");
        m_pData->ChunkModeActive.Attach(pNodeMap, "ChunkModeActive");
        m_pData->ChunkSelector.Attach(pNodeMap, "ChunkSelector");
        m_pData->ClearLastError.Attach(pNodeMap, "ClearLastError");
        m_pData->ColorAdjustmentEnable.Attach(pNodeMap, "ColorAdjustmentEnable");
        m_pData->ColorAdjustmentHue.Attach(pNodeMap, "ColorAdjustmentHue");
        m_pData->ColorAdjustmentHueRaw.Attach(pNodeMap, "ColorAdjustmentHueRaw");
        m_pData->ColorAdjustmentReset.Attach(pNodeMap, "ColorAdjustmentReset");
        m_pData->ColorAdjustmentSaturation.Attach(pNodeMap, "ColorAdjustmentSaturation");
        m_pData->ColorAdjustmentSaturationRaw.Attach(pNodeMap, "ColorAdjustmentSaturationRaw");
        m_pData->ColorAdjustmentSelector.Attach(pNodeMap, "ColorAdjustmentSelector");
        m_pData->ColorTransformationMatrixFactor.Attach(pNodeMap, "ColorTransformationMatrixFactor");
        m_pData->ColorTransformationMatrixFactorRaw.Attach(pNodeMap, "ColorTransformationMatrixFactorRaw");
        m_pData->ColorTransformationSelector.Attach(pNodeMap, "ColorTransformationSelector");
        m_pData->ColorTransformationValue.Attach(pNodeMap, "ColorTransformationValue");
        m_pData->ColorTransformationValueRaw.Attach(pNodeMap, "ColorTransformationValueRaw");
        m_pData->ColorTransformationValueSelector.Attach(pNodeMap, "ColorTransformationValueSelector");
        m_pData->CounterEventSource.Attach(pNodeMap, "CounterEventSource");
        m_pData->CounterReset.Attach(pNodeMap, "CounterReset");
        m_pData->CounterResetSource.Attach(pNodeMap, "CounterResetSource");
        m_pData->CounterSelector.Attach(pNodeMap, "CounterSelector");
        m_pData->CriticalTemperature.Attach(pNodeMap, "CriticalTemperature");
        m_pData->CriticalTemperatureEventStreamChannelIndex.Attach(pNodeMap, "CriticalTemperatureEventStreamChannelIndex");
        m_pData->CriticalTemperatureEventTimestamp.Attach(pNodeMap, "CriticalTemperatureEventTimestamp");
        m_pData->DecimationHorizontal.Attach(pNodeMap, "DecimationHorizontal");
        m_pData->DecimationVertical.Attach(pNodeMap, "DecimationVertical");
        m_pData->DemosaicingMode.Attach(pNodeMap, "DemosaicingMode");
        m_pData->DeviceFirmwareVersion.Attach(pNodeMap, "DeviceFirmwareVersion");
        m_pData->DeviceID.Attach(pNodeMap, "DeviceID");
        m_pData->DeviceManufacturerInfo.Attach(pNodeMap, "DeviceManufacturerInfo");
        m_pData->DeviceModelName.Attach(pNodeMap, "DeviceModelName");
        m_pData->DeviceRegistersStreamingEnd.Attach(pNodeMap, "DeviceRegistersStreamingEnd");
        m_pData->DeviceRegistersStreamingStart.Attach(pNodeMap, "DeviceRegistersStreamingStart");
        m_pData->DeviceReset.Attach(pNodeMap, "DeviceReset");
        m_pData->DeviceScanType.Attach(pNodeMap, "DeviceScanType");
        m_pData->DeviceUserID.Attach(pNodeMap, "DeviceUserID");
        m_pData->DeviceVendorName.Attach(pNodeMap, "DeviceVendorName");
        m_pData->DeviceVersion.Attach(pNodeMap, "DeviceVersion");
        m_pData->DigitalShift.Attach(pNodeMap, "DigitalShift");
        m_pData->EnableBurstAcquisition.Attach(pNodeMap, "EnableBurstAcquisition");
        m_pData->EventNotification.Attach(pNodeMap, "EventNotification");
        m_pData->EventOverrunEventFrameID.Attach(pNodeMap, "EventOverrunEventFrameID");
        m_pData->EventOverrunEventStreamChannelIndex.Attach(pNodeMap, "EventOverrunEventStreamChannelIndex");
        m_pData->EventOverrunEventTimestamp.Attach(pNodeMap, "EventOverrunEventTimestamp");
        m_pData->EventSelector.Attach(pNodeMap, "EventSelector");
        m_pData->ExpertFeatureAccessKey.Attach(pNodeMap, "ExpertFeatureAccessKey");
        m_pData->ExpertFeatureAccessSelector.Attach(pNodeMap, "ExpertFeatureAccessSelector");
        m_pData->ExpertFeatureEnable.Attach(pNodeMap, "ExpertFeatureEnable");
        m_pData->ExposureAuto.Attach(pNodeMap, "ExposureAuto");
        m_pData->ExposureEndEventFrameID.Attach(pNodeMap, "ExposureEndEventFrameID");
        m_pData->ExposureEndEventStreamChannelIndex.Attach(pNodeMap, "ExposureEndEventStreamChannelIndex");
        m_pData->ExposureEndEventTimestamp.Attach(pNodeMap, "ExposureEndEventTimestamp");
        m_pData->ExposureMode.Attach(pNodeMap, "ExposureMode");
        m_pData->ExposureOverlapTimeMaxAbs.Attach(pNodeMap, "ExposureOverlapTimeMaxAbs");
        m_pData->ExposureOverlapTimeMaxRaw.Attach(pNodeMap, "ExposureOverlapTimeMaxRaw");
        m_pData->ExposureOverlapTimeMode.Attach(pNodeMap, "ExposureOverlapTimeMode");
        m_pData->ExposureTimeAbs.Attach(pNodeMap, "ExposureTimeAbs");
        m_pData->ExposureTimeRaw.Attach(pNodeMap, "ExposureTimeRaw");
        m_pData->FileAccessBuffer.Attach(pNodeMap, "FileAccessBuffer");
        m_pData->FileAccessLength.Attach(pNodeMap, "FileAccessLength");
        m_pData->FileAccessOffset.Attach(pNodeMap, "FileAccessOffset");
        m_pData->FileOpenMode.Attach(pNodeMap, "FileOpenMode");
        m_pData->FileOperationExecute.Attach(pNodeMap, "FileOperationExecute");
        m_pData->FileOperationResult.Attach(pNodeMap, "FileOperationResult");
        m_pData->FileOperationSelector.Attach(pNodeMap, "FileOperationSelector");
        m_pData->FileOperationStatus.Attach(pNodeMap, "FileOperationStatus");
        m_pData->FileSelector.Attach(pNodeMap, "FileSelector");
        m_pData->FileSize.Attach(pNodeMap, "FileSize");
        m_pData->FrameStartEventStreamChannelIndex.Attach(pNodeMap, "FrameStartEventStreamChannelIndex");
        m_pData->FrameStartEventTimestamp.Attach(pNodeMap, "FrameStartEventTimestamp");
        m_pData->FrameStartOvertriggerEventStreamChannelIndex.Attach(pNodeMap, "FrameStartOvertriggerEventStreamChannelIndex");
        m_pData->FrameStartOvertriggerEventTimestamp.Attach(pNodeMap, "FrameStartOvertriggerEventTimestamp");
        m_pData->FrameStartWaitEventStreamChannelIndex.Attach(pNodeMap, "FrameStartWaitEventStreamChannelIndex");
        m_pData->FrameStartWaitEventTimestamp.Attach(pNodeMap, "FrameStartWaitEventTimestamp");
        m_pData->FrameTimeoutEventStreamChannelIndex.Attach(pNodeMap, "FrameTimeoutEventStreamChannelIndex");
        m_pData->FrameTimeoutEventTimestamp.Attach(pNodeMap, "FrameTimeoutEventTimestamp");
        m_pData->GainAuto.Attach(pNodeMap, "GainAuto");
        m_pData->GainRaw.Attach(pNodeMap, "GainRaw");
        m_pData->GainSelector.Attach(pNodeMap, "GainSelector");
        m_pData->Gamma.Attach(pNodeMap, "Gamma");
        m_pData->GammaEnable.Attach(pNodeMap, "GammaEnable");
        m_pData->GammaSelector.Attach(pNodeMap, "GammaSelector");
        m_pData->GevCCP.Attach(pNodeMap, "GevCCP");
        m_pData->GevCurrentDefaultGateway.Attach(pNodeMap, "GevCurrentDefaultGateway");
        m_pData->GevCurrentIPAddress.Attach(pNodeMap, "GevCurrentIPAddress");
        m_pData->GevCurrentIPConfiguration.Attach(pNodeMap, "GevCurrentIPConfiguration");
        m_pData->GevCurrentSubnetMask.Attach(pNodeMap, "GevCurrentSubnetMask");
        m_pData->GevDeviceModeCharacterSet.Attach(pNodeMap, "GevDeviceModeCharacterSet");
        m_pData->GevDeviceModeIsBigEndian.Attach(pNodeMap, "GevDeviceModeIsBigEndian");
        m_pData->GevFirstURL.Attach(pNodeMap, "GevFirstURL");
        m_pData->GevHeartbeatTimeout.Attach(pNodeMap, "GevHeartbeatTimeout");
        m_pData->GevIEEE1588.Attach(pNodeMap, "GevIEEE1588");
        m_pData->GevIEEE1588ClockId.Attach(pNodeMap, "GevIEEE1588ClockId");
        m_pData->GevIEEE1588DataSetLatch.Attach(pNodeMap, "GevIEEE1588DataSetLatch");
        m_pData->GevIEEE1588OffsetFromMaster.Attach(pNodeMap, "GevIEEE1588OffsetFromMaster");
        m_pData->GevIEEE1588ParentClockId.Attach(pNodeMap, "GevIEEE1588ParentClockId");
        m_pData->GevIEEE1588Status.Attach(pNodeMap, "GevIEEE1588Status");
        m_pData->GevIEEE1588StatusLatched.Attach(pNodeMap, "GevIEEE1588StatusLatched");
        m_pData->GevInterfaceSelector.Attach(pNodeMap, "GevInterfaceSelector");
        m_pData->GevLinkCrossover.Attach(pNodeMap, "GevLinkCrossover");
        m_pData->GevLinkFullDuplex.Attach(pNodeMap, "GevLinkFullDuplex");
        m_pData->GevLinkMaster.Attach(pNodeMap, "GevLinkMaster");
        m_pData->GevLinkSpeed.Attach(pNodeMap, "GevLinkSpeed");
        m_pData->GevMACAddress.Attach(pNodeMap, "GevMACAddress");
        m_pData->GevMessageChannelCount.Attach(pNodeMap, "GevMessageChannelCount");
        m_pData->GevNumberOfInterfaces.Attach(pNodeMap, "GevNumberOfInterfaces");
        m_pData->GevPersistentDefaultGateway.Attach(pNodeMap, "GevPersistentDefaultGateway");
        m_pData->GevPersistentIPAddress.Attach(pNodeMap, "GevPersistentIPAddress");
        m_pData->GevPersistentSubnetMask.Attach(pNodeMap, "GevPersistentSubnetMask");
        m_pData->GevSCBWA.Attach(pNodeMap, "GevSCBWA");
        m_pData->GevSCBWR.Attach(pNodeMap, "GevSCBWR");
        m_pData->GevSCBWRA.Attach(pNodeMap, "GevSCBWRA");
        m_pData->GevSCDA.Attach(pNodeMap, "GevSCDA");
        m_pData->GevSCDCT.Attach(pNodeMap, "GevSCDCT");
        m_pData->GevSCDMT.Attach(pNodeMap, "GevSCDMT");
        m_pData->GevSCFJM.Attach(pNodeMap, "GevSCFJM");
        m_pData->GevSCFTD.Attach(pNodeMap, "GevSCFTD");
        m_pData->GevSCPD.Attach(pNodeMap, "GevSCPD");
        m_pData->GevSCPHostPort.Attach(pNodeMap, "GevSCPHostPort");
        m_pData->GevSCPInterfaceIndex.Attach(pNodeMap, "GevSCPInterfaceIndex");
        m_pData->GevSCPSBigEndian.Attach(pNodeMap, "GevSCPSBigEndian");
        m_pData->GevSCPSDoNotFragment.Attach(pNodeMap, "GevSCPSDoNotFragment");
        m_pData->GevSCPSPacketSize.Attach(pNodeMap, "GevSCPSPacketSize");
        m_pData->GevSecondURL.Attach(pNodeMap, "GevSecondURL");
        m_pData->GevStreamChannelCount.Attach(pNodeMap, "GevStreamChannelCount");
        m_pData->GevStreamChannelSelector.Attach(pNodeMap, "GevStreamChannelSelector");
        m_pData->GevSupportedIEEE1588.Attach(pNodeMap, "GevSupportedIEEE1588");
        m_pData->GevSupportedIPConfigurationDHCP.Attach(pNodeMap, "GevSupportedIPConfigurationDHCP");
        m_pData->GevSupportedIPConfigurationLLA.Attach(pNodeMap, "GevSupportedIPConfigurationLLA");
        m_pData->GevSupportedIPConfigurationPersistentIP.Attach(pNodeMap, "GevSupportedIPConfigurationPersistentIP");
        m_pData->GevSupportedOptionalCommandsConcatenation.Attach(pNodeMap, "GevSupportedOptionalCommandsConcatenation");
        m_pData->GevSupportedOptionalCommandsEVENT.Attach(pNodeMap, "GevSupportedOptionalCommandsEVENT");
        m_pData->GevSupportedOptionalCommandsEVENTDATA.Attach(pNodeMap, "GevSupportedOptionalCommandsEVENTDATA");
        m_pData->GevSupportedOptionalCommandsPACKETRESEND.Attach(pNodeMap, "GevSupportedOptionalCommandsPACKETRESEND");
        m_pData->GevSupportedOptionalCommandsWRITEMEM.Attach(pNodeMap, "GevSupportedOptionalCommandsWRITEMEM");
        m_pData->GevSupportedOptionalLegacy16BitBlockID.Attach(pNodeMap, "GevSupportedOptionalLegacy16BitBlockID");
        m_pData->GevTimestampControlLatch.Attach(pNodeMap, "GevTimestampControlLatch");
        m_pData->GevTimestampControlLatchReset.Attach(pNodeMap, "GevTimestampControlLatchReset");
        m_pData->GevTimestampControlReset.Attach(pNodeMap, "GevTimestampControlReset");
        m_pData->GevTimestampTickFrequency.Attach(pNodeMap, "GevTimestampTickFrequency");
        m_pData->GevTimestampValue.Attach(pNodeMap, "GevTimestampValue");
        m_pData->GevVersionMajor.Attach(pNodeMap, "GevVersionMajor");
        m_pData->GevVersionMinor.Attach(pNodeMap, "GevVersionMinor");
        m_pData->GrayValueAdjustmentDampingAbs.Attach(pNodeMap, "GrayValueAdjustmentDampingAbs");
        m_pData->GrayValueAdjustmentDampingRaw.Attach(pNodeMap, "GrayValueAdjustmentDampingRaw");
        m_pData->Height.Attach(pNodeMap, "Height");
        m_pData->HeightMax.Attach(pNodeMap, "HeightMax");
        m_pData->LUTEnable.Attach(pNodeMap, "LUTEnable");
        m_pData->LUTIndex.Attach(pNodeMap, "LUTIndex");
        m_pData->LUTSelector.Attach(pNodeMap, "LUTSelector");
        m_pData->LUTValue.Attach(pNodeMap, "LUTValue");
        m_pData->LUTValueAll.Attach(pNodeMap, "LUTValueAll");
        m_pData->LastError.Attach(pNodeMap, "LastError");
        m_pData->LightSourceSelector.Attach(pNodeMap, "LightSourceSelector");
        m_pData->Line1RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "Line1RisingEdgeEventStreamChannelIndex");
        m_pData->Line1RisingEdgeEventTimestamp.Attach(pNodeMap, "Line1RisingEdgeEventTimestamp");
        m_pData->Line2RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "Line2RisingEdgeEventStreamChannelIndex");
        m_pData->Line2RisingEdgeEventTimestamp.Attach(pNodeMap, "Line2RisingEdgeEventTimestamp");
        m_pData->Line3RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "Line3RisingEdgeEventStreamChannelIndex");
        m_pData->Line3RisingEdgeEventTimestamp.Attach(pNodeMap, "Line3RisingEdgeEventTimestamp");
        m_pData->Line4RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "Line4RisingEdgeEventStreamChannelIndex");
        m_pData->Line4RisingEdgeEventTimestamp.Attach(pNodeMap, "Line4RisingEdgeEventTimestamp");
        m_pData->LineDebouncerTimeAbs.Attach(pNodeMap, "LineDebouncerTimeAbs");
        m_pData->LineFormat.Attach(pNodeMap, "LineFormat");
        m_pData->LineInverter.Attach(pNodeMap, "LineInverter");
        m_pData->LineLogic.Attach(pNodeMap, "LineLogic");
        m_pData->LineMode.Attach(pNodeMap, "LineMode");
        m_pData->LineSelector.Attach(pNodeMap, "LineSelector");
        m_pData->LineSource.Attach(pNodeMap, "LineSource");
        m_pData->LineStartOvertriggerEventStreamChannelIndex.Attach(pNodeMap, "LineStartOvertriggerEventStreamChannelIndex");
        m_pData->LineStartOvertriggerEventTimestamp.Attach(pNodeMap, "LineStartOvertriggerEventTimestamp");
        m_pData->LineStatus.Attach(pNodeMap, "LineStatus");
        m_pData->LineStatusAll.Attach(pNodeMap, "LineStatusAll");
        m_pData->LineTermination.Attach(pNodeMap, "LineTermination");
        m_pData->MinOutPulseWidthAbs.Attach(pNodeMap, "MinOutPulseWidthAbs");
        m_pData->NoiseReductionAbs.Attach(pNodeMap, "NoiseReductionAbs");
        m_pData->NoiseReductionRaw.Attach(pNodeMap, "NoiseReductionRaw");
        m_pData->NumberOfActionSignals.Attach(pNodeMap, "NumberOfActionSignals");
        m_pData->OffsetX.Attach(pNodeMap, "OffsetX");
        m_pData->OffsetY.Attach(pNodeMap, "OffsetY");
        m_pData->OverTemperature.Attach(pNodeMap, "OverTemperature");
        m_pData->OverTemperatureEventStreamChannelIndex.Attach(pNodeMap, "OverTemperatureEventStreamChannelIndex");
        m_pData->OverTemperatureEventTimestamp.Attach(pNodeMap, "OverTemperatureEventTimestamp");
        m_pData->ParameterSelector.Attach(pNodeMap, "ParameterSelector");
        m_pData->PayloadSize.Attach(pNodeMap, "PayloadSize");
        m_pData->PixelColorFilter.Attach(pNodeMap, "PixelColorFilter");
        m_pData->PixelDynamicRangeMax.Attach(pNodeMap, "PixelDynamicRangeMax");
        m_pData->PixelDynamicRangeMin.Attach(pNodeMap, "PixelDynamicRangeMin");
        m_pData->PixelFormat.Attach(pNodeMap, "PixelFormat");
        m_pData->PixelSize.Attach(pNodeMap, "PixelSize");
        m_pData->ReadoutTimeAbs.Attach(pNodeMap, "ReadoutTimeAbs");
        m_pData->RemoveLimits.Attach(pNodeMap, "RemoveLimits");
        m_pData->ResultingFramePeriodAbs.Attach(pNodeMap, "ResultingFramePeriodAbs");
        m_pData->ResultingFrameRateAbs.Attach(pNodeMap, "ResultingFrameRateAbs");
        m_pData->ReverseX.Attach(pNodeMap, "ReverseX");
        m_pData->ReverseY.Attach(pNodeMap, "ReverseY");
        m_pData->ScalingHorizontalAbs.Attach(pNodeMap, "ScalingHorizontalAbs");
        m_pData->ScalingVerticalAbs.Attach(pNodeMap, "ScalingVerticalAbs");
        m_pData->SensorHeight.Attach(pNodeMap, "SensorHeight");
        m_pData->SensorReadoutMode.Attach(pNodeMap, "SensorReadoutMode");
        m_pData->SensorWidth.Attach(pNodeMap, "SensorWidth");
        m_pData->SequenceAddressBitSelector.Attach(pNodeMap, "SequenceAddressBitSelector");
        m_pData->SequenceAddressBitSource.Attach(pNodeMap, "SequenceAddressBitSource");
        m_pData->SequenceAdvanceMode.Attach(pNodeMap, "SequenceAdvanceMode");
        m_pData->SequenceAsyncAdvance.Attach(pNodeMap, "SequenceAsyncAdvance");
        m_pData->SequenceAsyncRestart.Attach(pNodeMap, "SequenceAsyncRestart");
        m_pData->SequenceConfigurationMode.Attach(pNodeMap, "SequenceConfigurationMode");
        m_pData->SequenceControlSelector.Attach(pNodeMap, "SequenceControlSelector");
        m_pData->SequenceControlSource.Attach(pNodeMap, "SequenceControlSource");
        m_pData->SequenceCurrentSet.Attach(pNodeMap, "SequenceCurrentSet");
        m_pData->SequenceEnable.Attach(pNodeMap, "SequenceEnable");
        m_pData->SequenceSetExecutions.Attach(pNodeMap, "SequenceSetExecutions");
        m_pData->SequenceSetIndex.Attach(pNodeMap, "SequenceSetIndex");
        m_pData->SequenceSetLoad.Attach(pNodeMap, "SequenceSetLoad");
        m_pData->SequenceSetStore.Attach(pNodeMap, "SequenceSetStore");
        m_pData->SequenceSetTotalNumber.Attach(pNodeMap, "SequenceSetTotalNumber");
        m_pData->SharpnessEnhancementAbs.Attach(pNodeMap, "SharpnessEnhancementAbs");
        m_pData->SharpnessEnhancementRaw.Attach(pNodeMap, "SharpnessEnhancementRaw");
        m_pData->ShutterMode.Attach(pNodeMap, "ShutterMode");
        m_pData->SyncFreeRunTimerEnable.Attach(pNodeMap, "SyncFreeRunTimerEnable");
        m_pData->SyncFreeRunTimerStartTimeHigh.Attach(pNodeMap, "SyncFreeRunTimerStartTimeHigh");
        m_pData->SyncFreeRunTimerStartTimeLow.Attach(pNodeMap, "SyncFreeRunTimerStartTimeLow");
        m_pData->SyncFreeRunTimerTriggerRateAbs.Attach(pNodeMap, "SyncFreeRunTimerTriggerRateAbs");
        m_pData->SyncFreeRunTimerUpdate.Attach(pNodeMap, "SyncFreeRunTimerUpdate");
        m_pData->SyncUserOutputSelector.Attach(pNodeMap, "SyncUserOutputSelector");
        m_pData->SyncUserOutputValue.Attach(pNodeMap, "SyncUserOutputValue");
        m_pData->SyncUserOutputValueAll.Attach(pNodeMap, "SyncUserOutputValueAll");
        m_pData->TemperatureAbs.Attach(pNodeMap, "TemperatureAbs");
        m_pData->TemperatureSelector.Attach(pNodeMap, "TemperatureSelector");
        m_pData->TemperatureState.Attach(pNodeMap, "TemperatureState");
        m_pData->TestImageResetAndHold.Attach(pNodeMap, "TestImageResetAndHold");
        m_pData->TestImageSelector.Attach(pNodeMap, "TestImageSelector");
        m_pData->TimerDelayAbs.Attach(pNodeMap, "TimerDelayAbs");
        m_pData->TimerDelayRaw.Attach(pNodeMap, "TimerDelayRaw");
        m_pData->TimerDurationAbs.Attach(pNodeMap, "TimerDurationAbs");
        m_pData->TimerDurationRaw.Attach(pNodeMap, "TimerDurationRaw");
        m_pData->TimerSelector.Attach(pNodeMap, "TimerSelector");
        m_pData->TimerTriggerActivation.Attach(pNodeMap, "TimerTriggerActivation");
        m_pData->TimerTriggerSource.Attach(pNodeMap, "TimerTriggerSource");
        m_pData->TriggerActivation.Attach(pNodeMap, "TriggerActivation");
        m_pData->TriggerDelayAbs.Attach(pNodeMap, "TriggerDelayAbs");
        m_pData->TriggerMode.Attach(pNodeMap, "TriggerMode");
        m_pData->TriggerSelector.Attach(pNodeMap, "TriggerSelector");
        m_pData->TriggerSoftware.Attach(pNodeMap, "TriggerSoftware");
        m_pData->TriggerSource.Attach(pNodeMap, "TriggerSource");
        m_pData->UserDefinedValue.Attach(pNodeMap, "UserDefinedValue");
        m_pData->UserDefinedValueSelector.Attach(pNodeMap, "UserDefinedValueSelector");
        m_pData->UserOutputSelector.Attach(pNodeMap, "UserOutputSelector");
        m_pData->UserOutputValue.Attach(pNodeMap, "UserOutputValue");
        m_pData->UserOutputValueAll.Attach(pNodeMap, "UserOutputValueAll");
        m_pData->UserSetDefaultSelector.Attach(pNodeMap, "UserSetDefaultSelector");
        m_pData->UserSetLoad.Attach(pNodeMap, "UserSetLoad");
        m_pData->UserSetSave.Attach(pNodeMap, "UserSetSave");
        m_pData->UserSetSelector.Attach(pNodeMap, "UserSetSelector");
        m_pData->VirtualLine1RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "VirtualLine1RisingEdgeEventStreamChannelIndex");
        m_pData->VirtualLine1RisingEdgeEventTimestamp.Attach(pNodeMap, "VirtualLine1RisingEdgeEventTimestamp");
        m_pData->VirtualLine2RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "VirtualLine2RisingEdgeEventStreamChannelIndex");
        m_pData->VirtualLine2RisingEdgeEventTimestamp.Attach(pNodeMap, "VirtualLine2RisingEdgeEventTimestamp");
        m_pData->VirtualLine3RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "VirtualLine3RisingEdgeEventStreamChannelIndex");
        m_pData->VirtualLine3RisingEdgeEventTimestamp.Attach(pNodeMap, "VirtualLine3RisingEdgeEventTimestamp");
        m_pData->VirtualLine4RisingEdgeEventStreamChannelIndex.Attach(pNodeMap, "VirtualLine4RisingEdgeEventStreamChannelIndex");
        m_pData->VirtualLine4RisingEdgeEventTimestamp.Attach(pNodeMap, "VirtualLine4RisingEdgeEventTimestamp");
        m_pData->Width.Attach(pNodeMap, "Width");
        m_pData->WidthMax.Attach(pNodeMap, "WidthMax");
    }

    //! \endcond

} // namespace Pylon
} // namespace BaslerCameraCameraParams_Params

#ifdef _MSC_VER
#pragma warning( pop )
#endif