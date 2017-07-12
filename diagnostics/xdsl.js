const { TextMessage, Button, ButtonsListMessage } = require("../platforms/generics");
const diagCst = require("../constants/diagnostics").xdsl.FR;
const v = require("voca");


const checkxDSLDiagAdvanced = (diag) => {
  let responses = "";
  let linePb = false;

  responses = v.sprintf(diagCst.diagnosticTime, new Date(diag.diagnosticTime).toUTCString());

  if (diag.isModemConnected != null) {
    if (!diag.isModemConnected) {
      responses += diagCst.diagnosticModemUnplug;
      linePb = true;
    } else {
      responses += diagCst.diagnosticModemPlug;
    }
  }

  if (diag.lineDetails != null && Array.isArray(diag.lineDetails)) {
    responses += diagCst.diagnosticLineStatus;
    for (let i = 0; i < diag.lineDetails.length; i++) {
      // detect sync
      const lineDiag = diag.lineDetails[i];
      responses += v.sprintf(diagCst.diagnosticLineSync, lineDiag.number, lineDiag.sync ? diagCst.sync : diagCst.unsync);
      if (lineDiag.lineTest != null) {
        switch (lineDiag.lineTest) {
        case "customerSideProblem":
          responses += diagCst.diagnosticCustomerSideProblem;
          break;
        case "ovhSideProblem":
          responses += diagCst.diagnosticOvhSideProblem;
          break;
        case "error":
          responses += diagCst.diagnosticError;
          break;
        default:break;
        }
      }
      if (!lineDiag.sync) {
        linePb = true;
      }
    }
  }

  if (diag.ping != null) {
    if (!diag.ping) {
      responses += diagCst.diagnosticPing;
      linePb = true;
    } else {
      responses += diagCst.diagnosticNoPing;
    }
  }

  if (!linePb) {
    responses += diagCst.diagnosticResultOk;
  } else {
    responses += diagCst.diagnosticResultNOk;
  }

  responses += diagCst.diagnosticResultMore;

  return [new TextMessage(responses)];
};

const checkxDSLDiag = (xdslOffer, serviceInfos, orderFollowUp, incident, diag) => {
  let responses = [];
  let orderOk = false;
  let orderString = "";

  if (incident != null) {
    responses = [new TextMessage(v.sprintf(diagCst.incident, incident.comment || "N/A", incident.endDate || "N/A", `http://travaux.ovh.net/?do=details&id=${incident.taskId}`))];
  }

  for (let i = 0; i < orderFollowUp.length; i++) {
    const orderStep = orderFollowUp[i];
    switch (orderStep.status) {
    case "doing":
    case "todo":
    case "error":
      orderString += v.sprintf(diagCst.orderStepStatus, orderStep.name, diagCst[orderStep.status], `${orderStep.expectedDuration} ${orderStep.durationUnit}`);
      break;
    case "done":
      if (orderStep.name === "accessIsOperational") {
        orderOk = true;
      }
      break;
    default:
      break;
    }
  }

  if (!orderOk) {
    return [...responses, new TextMessage(v.sprintf(diagCst.orderNotReady, orderString))];
  }

  if (xdslOffer.status === "slamming") {
    const button = new Button("web_url", "tel:1007", diagCst.callSupport);
    responses = [...responses, new ButtonsListMessage(diagCst.lineSlamming, [button])];
  }

  if (serviceInfos.status === "unPaid") {
    responses = [...responses, new TextMessage(diagCst.lineUnPaid)];
  }

  if (responses.length === 0) {
    const button = new Button("postback", `XDSL_DIAG_${xdslOffer.accessName}`, diagCst.launchDiag);
    responses = [new TextMessage(diagCst.resultOk), new TextMessage(v.sprintf(diagCst.resultDiagRemaining, diag ? diag.remaining : 5)), new ButtonsListMessage(diagCst.resultAdvancedDiag, [button])];
  }

  if (diag) {
    responses = [...responses, new TextMessage(diagCst.resultLastDiag), ...checkxDSLDiagAdvanced(diag)];
  }
  return responses;
};


module.exports = {
  checkxDSLDiag,
  checkxDSLDiagAdvanced
};