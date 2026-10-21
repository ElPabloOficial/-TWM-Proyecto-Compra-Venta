using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class despachar2
{
    public int id_empresad { get; set; }

    public int id_despacho { get; set; }

    public int? numeroseguimiento { get; set; }

    public virtual despacho id_despachoNavigation { get; set; } = null!;

    public virtual empresadespacho id_empresadNavigation { get; set; } = null!;
}
