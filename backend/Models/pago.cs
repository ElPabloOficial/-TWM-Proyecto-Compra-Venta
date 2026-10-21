using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class pago
{
    public int id { get; set; }

    public string mediopago { get; set; } = null!;

    public int? ult4digitostarjeta { get; set; }

    public int? codigotransferencia { get; set; }

    public virtual ICollection<generar3> generar3s { get; set; } = new List<generar3>();

    public virtual ICollection<generar4> generar4s { get; set; } = new List<generar4>();
}
