import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_ins/omniscriptBaseMixin';
import RIDER_ICONS from '@salesforce/resourceUrl/rider_icons';

export default class RidersSelection extends OmniscriptBaseMixin(LightningElement) {

    class001 = `${RIDER_ICONS}/Rider_Care.png`;
    class002 = `${RIDER_ICONS}/Rider_PayorsClause.png`;
    class003 = `${RIDER_ICONS}/Rider_Protector.png`;
    class004 = `${RIDER_ICONS}/Rider_Secure.png`;
    class005 = `${RIDER_ICONS}/Rider_Critical Condition.png`;
    class006 = `${RIDER_ICONS}/Rider_WaiverOfPremium.png`;
    class007 = `${RIDER_ICONS}/Rider_BrightRiderPlus.png`;
    class008 = `${RIDER_ICONS}/Rider_HealthMaxRider.png`;
    
    @track logos = [
        {key: 'class001', value: this.class001},
        {key: 'class002', value: this.class002},
        {key: 'class003', value: this.class003},
        {key: 'class004', value: this.class004},
        {key: 'class005', value: this.class005},
        {key: 'class006', value: this.class006},
        {key: 'class007', value: this.class007},
        {key: 'class008', value: this.class008},
        {key: 'class009', value: this.class001}, 
        {key: 'class010', value: this.class002}, 
        {key: 'class011', value: this.class006}, 
        {key: 'class012', value: this.class005}, 
        {key: 'class013', value: this.class005}, 
        {key: 'class014', value: this.class005},
    ];

    @api riders;
    @api newMap = new Map([]);
    @api riderGroupPlaceholder = {
        RiderGroupId: '',
        RiderGroupName: '',
        RiderProductGroupDescription: '',
        RiderGroupProductCode: '',
        RiderGroupLogo: this.protectorLogo,
        RiderGroupIsAdded: false,
        RiderOptions: [],
        HasRiderOptions: false,
        RiderOptionSelected: {},
        RiderSumInsured: null,
        RiderProductName: '',
        RiderProductId: '',
        RiderButtonClickedText: 'Added',
        RiderButtonNotClickedText: 'Add Rider'
    }
    @api riderGroups = [];
    @track birthDate;
    @track isSmoker;
    @track boolTrue = true;
    @track boolFalse = false;

    get productId() {
        return this.omniJsonData.ProductId;
    }

    connectedCallback() {
        console.log('omniJsonData on load: ' + JSON.stringify(this.omniJsonData,null,'\t'));
        this.birthDate = this.omniJsonData?.Step_ProductSelection?.DateOfBirth;

        // if running from ProposalRider, remove if running from ProposalPage
        let dateString = '15/12/2022'
        let [day, month, year] = dateString.split('/')
        // if running from ProposalRider, remove if running from ProposalPage

        this.isSmoker = this.omniJsonData?.Step_ProductSelection?.DoYouSmoke == '1' ? true : false;
    
        // if running from ProposalRider, remove if running from ProposalPage
        let birthDateNum = this.convertDateToNum(new Date(+year, +month - 1, +day));
        // if running from ProposalRider, remove if running from ProposalPage

        // let birthDateNum = this.convertDateToNum(new Date(this.birthDate)); // uncomment if running from ProposalRider
        let dateTodayNum = this.convertDateToNum(new Date());

        if (this.omniJsonData?.Riders) {
            this.riders = [...JSON.parse(JSON.stringify(this.omniJsonData.Riders))];
            this.riders.forEach(rider => {        
                this.buildRiderGroupInfo(rider, birthDateNum, dateTodayNum);
                
            });
        } else {
            console.log('no riders');
        }
    }

    getDateDiff(dateInitial, dateFinal) {
        return (dateFinal - dateInitial);
    }

    buildRiderGroupInfo(newRider, birthDateNum, dateTodayNum) {
        let riderInfo = {...this.riderGroupPlaceholder};
        
        if (this.riderGroups.find((riderGroup) => newRider.RiderGroupName == riderGroup.RiderGroupName)) {
            let riderGroupIndex = this.riderGroups.findIndex(riderGroup => riderGroup.RiderGroupName == newRider.RiderGroupName);
            let riderGroup = this.riderGroups[riderGroupIndex];
            riderGroup.HasRiderOptions = true;
            if (this.validateEligibility(newRider, birthDateNum, dateTodayNum)) {
                riderGroup.RiderOptions.push({label: newRider.RiderProductName, value: newRider.RiderProductId});
            }
        } else {
            if (this.validateEligibility(newRider, birthDateNum, dateTodayNum)) {
                riderInfo.RiderGroupId = newRider.RiderGroupId;
                riderInfo.RiderGroupName = newRider.RiderGroupName;
                riderInfo.RiderProductGroupDescription = newRider.RiderProductGroupDescription;
                riderInfo.RiderOptions = [{label: newRider.RiderProductName, value: newRider.RiderProductId}];
                riderInfo.HasRiderOptions = true;
                riderInfo.RiderProductName = newRider.RiderProductName;
                riderInfo.RiderProductId = newRider.RiderProductId;
                riderInfo.RiderGroupProductCode = newRider.RiderGroupProductCode;
                if (this.logos.find((logo) => logo.key == newRider.RiderGroupProductCode.toString())) {
                    riderInfo.RiderGroupLogo = this.logos.find((logo) => logo.key == newRider.RiderGroupProductCode.toString()).value;
                }
                this.riderGroups.push(riderInfo);
            }
        }
    }

    validateEligibility(newRider, birthDateNum, dateTodayNum) {
        let eligibilityCriteria = newRider.RiderEligibilityCriteria;
        let newEligibilityCriteria = eligibilityCriteria.replaceAll('True', 'this.boolTrue');
        newEligibilityCriteria = newEligibilityCriteria.replaceAll('False', 'this.boolFalse');
        newEligibilityCriteria = newEligibilityCriteria.replaceAll('Life.Smoker', 'this.isSmoker');
        newEligibilityCriteria = newEligibilityCriteria.replaceAll('Life.DateofBirth', 'birthDateNum');
        newEligibilityCriteria = newEligibilityCriteria.replaceAll('TODAY()', 'dateTodayNum');
        newEligibilityCriteria = newEligibilityCriteria.replaceAll('DATEDIFF', 'this.getDateDiff');

        // console.log('newEligibilityCriteria string: ' +  JSON.stringify(newEligibilityCriteria));
        console.log('newEligibilityCriteria string: ' +  JSON.stringify(newEligibilityCriteria));
        console.log('this.isSmoker: ' +  this.isSmoker);
        console.log('this.boolTrue: ' +  this.boolTrue);
        console.log('birthDateNum: ' +  birthDateNum);
        console.log('dateTodayNum: ' +  dateTodayNum);
        console.log('getDateDiff(): ' +  this.getDateDiff(birthDateNum, dateTodayNum));
        console.log('date diff: ' +  eval('this.getDateDiff(birthDateNum, dateTodayNum) < (18*365.25)') + ' < (18*365.25): ' + eval('(18*365.25)'));
        console.log('date diff: ' +  eval('this.getDateDiff(birthDateNum, dateTodayNum) < (66*365.25)') + ' < (66*365.25): ' + eval('(66*365.25)'));
        console.log('date diff >= 0: ' +  eval('this.getDateDiff(birthDateNum, dateTodayNum) >= 0'));
        console.log('newEligibilityCriteria eval: ' +  eval(newEligibilityCriteria));

        return eval(newEligibilityCriteria);
    }

    convertDateToNum(dateVal) {
        return 25569.0 + ((dateVal.getTime() - (dateVal.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
    }

    handleChangeRiderOption(event) {
        let selectedLabel = event.target.options.find(opt => opt.value === event.detail.value).label;
        let updatedRider = this.riderGroups.find((rider) => rider.RiderGroupName == event.target.dataset.id);
        updatedRider.RiderOptionSelected = {label: selectedLabel, value: event.target.value};
        setTimeout(() => { this.sendData();}, 500);
    }

    handleChangeSumInsured(event) {
        let updatedRider = this.riderGroups.find((rider) => rider.RiderGroupName == event.target.dataset.id);
        updatedRider.RiderSumInsured = event.target.value;
        setTimeout(() => { this.sendData();}, 500);
    }

    handleAddRider(event) {
        let updatedRider = this.riderGroups.find((rider) => rider.RiderGroupName == event.currentTarget.dataset.name);
        updatedRider.RiderGroupIsAdded = !updatedRider.RiderGroupIsAdded;
        this.riderGroups = [...this.riderGroups];
        this.updateAddRiderUI(event, updatedRider.RiderGroupIsAdded);
        this.sendData();
    }

    updateAddRiderUI(event, addRiderButtonIsClicked) {
        let dataName = event.currentTarget.dataset.name;
        if (addRiderButtonIsClicked) {
            this.template.querySelectorAll(`[data-name="` + dataName +`"]`).forEach(button => { button.classList.remove('slds-is-selected-clicked'); });
            this.template.querySelectorAll(`[data-name="` + dataName +`"]`).forEach(button => { button.classList.add('slds-is-pressed', 'button-pressed', 'slds-not-selected'); });
        } else {
            this.template.querySelector(`[data-name="` + dataName +`"]`).classList.remove('slds-is-pressed', 'button-pressed', 'slds-not-selected', 'slds-is-selected-clicked');
        }
    }

    handleClick(event) {
        let dataName = event.currentTarget.dataset.name;
        this.template.querySelector(`[data-name="` + dataName +`"]`).classList.add('slds-is-pressed');
    }

    sendData() {
        let selectedRiders = this.riderGroups.filter((rider) => rider.RiderGroupIsAdded == true);
        let data = {
            SelectedRiders: selectedRiders
        };
        console.log('selectedRiders: ' + JSON.stringify(selectedRiders,null,'\t'));
        this.omniApplyCallResp(data);
    }
}
